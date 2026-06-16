import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';
import { UserService } from '../../../core/services/user.service';
import { ContentResponse } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { LocalDataService, Comment } from '../../../core/services/local-data.service';

@Component({
  selector: 'app-content-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  templateUrl: './content-detail.component.html',
  styleUrl: './content-detail.component.scss',
})
export class ContentDetailComponent implements OnInit, OnDestroy {
  readonly item = signal<ContentResponse | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly blocked = signal(false);

  private watchStartTime: number | null = null;

  liked = false;
  likeCount = 0;
  starred = false;

  readonly speaking = signal(false);

  comments = signal<Comment[]>([]);
  readonly commentText = new FormControl('', { nonNullable: true });
  readonly replyText = new FormControl('', { nonNullable: true });
  replyingToId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly contentService: ContentService,
    private readonly userService: UserService,
    private readonly sanitizer: DomSanitizer,
    readonly auth: AuthService,
    readonly localData: LocalDataService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error.set('מזהה לא תקין'); this.loading.set(false); return; }

    this.contentService.getById(id).subscribe({
      next: (data) => {
        this.item.set(data);
        this.loading.set(false);
        this.liked = this.localData.hasLiked(id);
        this.likeCount = this.localData.getLikes(id);
        this.starred = this.localData.isStarred(id);
        this.comments.set(this.localData.getComments(id));

        if (data.contentType === 'Video') {
          this.checkWatchLimit();
        }
      },
      error: () => { this.error.set('התוכן לא נמצא'); this.loading.set(false); },
    });
  }

  ngOnDestroy(): void {
    speechSynthesis.cancel();
    this.reportWatchTime();
  }

  private reportWatchTime(): void {
    if (!this.watchStartTime) return;
    const seconds = Math.floor((Date.now() - this.watchStartTime) / 1000);
    this.watchStartTime = null;
    if (seconds <= 0) return;
    const user = this.auth.currentUser();
    if (!user || this.auth.isAdmin()) return;

    // עדכון מיידי מקומי
    const newSeconds = (user.monthlyWatchedSeconds ?? 0) + seconds;
    this.auth.updateStoredUser({ ...user, monthlyWatchedSeconds: newSeconds });

    // שמירה ב-localStorage לשליחה בטוחה לשרת
    const pending = Number(localStorage.getItem('pending_watch_seconds') ?? 0);
    localStorage.setItem('pending_watch_seconds', String(pending + seconds));
    localStorage.setItem('pending_watch_user_id', user.id);

    // ניסיון שליחה מיידי
    this.userService.updateWatchTime(user.id, seconds).subscribe({
      next: () => {
        // הצליח — נקה את ה-pending
        const stillPending = Number(localStorage.getItem('pending_watch_seconds') ?? 0);
        if (stillPending > 0) {
          localStorage.removeItem('pending_watch_seconds');
          localStorage.removeItem('pending_watch_user_id');
        }
      },
    });
  }

  private checkWatchLimit(): void {
    const user = this.auth.currentUser();
    if (this.auth.isAdmin() || user?.isSubscriber) {
      this.watchStartTime = Date.now();
      return;
    }
    if (user) {
      this.userService.canWatch(user.id).subscribe({
        next: (can) => { this.blocked.set(!can); if (can) this.watchStartTime = Date.now(); },
      });
    } else {
      const month = new Date().toISOString().slice(0, 7);
      const storedMonth = localStorage.getItem('guest_watch_month');
      if (storedMonth !== month) {
        localStorage.setItem('guest_watch_month', month);
        localStorage.setItem('guest_watched_seconds', '0');
      }
      const watched = Number(localStorage.getItem('guest_watched_seconds') ?? 0);
      const can = watched < 108000;
      this.blocked.set(!can);
      if (can) this.watchStartTime = Date.now();
    }
  }

  safeUrl(url: string): SafeResourceUrl {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  listRoute(): string {
    return this.item()?.contentType === 'Article' ? '/articles' : '/videos';
  }

  toggleLike(): void {
    const id = this.item()?.id;
    if (!id) return;
    const result = this.localData.toggleLike(id);
    this.liked = result.liked;
    this.likeCount = result.count;
  }

  toggleStar(): void {
    const id = this.item()?.id;
    if (!id) return;
    this.starred = this.localData.toggleStar(id);
  }

  toggleSpeech(): void {
    if (this.speaking()) {
      speechSynthesis.cancel();
      this.speaking.set(false);
      return;
    }
    const text = this.item()?.body ?? this.item()?.description ?? '';
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'he-IL';
    utter.onend = () => this.speaking.set(false);
    utter.onerror = () => this.speaking.set(false);
    speechSynthesis.speak(utter);
    this.speaking.set(true);
  }

  rootComments(): Comment[] {
    return this.comments().filter((c) => c.parentId === null);
  }

  repliesFor(id: string): Comment[] {
    return this.comments().filter((c) => c.parentId === id);
  }

  submitComment(): void {
    const text = this.commentText.value.trim();
    const id = this.item()?.id;
    if (!text || !id) return;
    const authorName = this.auth.currentUser()?.firstName ?? 'אורח';
    this.localData.addComment(id, text, authorName, null);
    this.comments.set(this.localData.getComments(id));
    this.commentText.setValue('');
  }

  submitReply(parentId: string): void {
    const text = this.replyText.value.trim();
    const id = this.item()?.id;
    if (!text || !id) return;
    const authorName = this.auth.currentUser()?.firstName ?? 'אורח';
    this.localData.addComment(id, text, authorName, parentId);
    this.comments.set(this.localData.getComments(id));
    this.replyText.setValue('');
    this.replyingToId = null;
  }

  deleteComment(commentId: string): void {
    const id = this.item()?.id;
    if (!id) return;
    this.localData.deleteComment(id, commentId);
    this.comments.set(this.localData.getComments(id));
  }

  startReply(id: string): void {
    this.replyingToId = this.replyingToId === id ? null : id;
    this.replyText.setValue('');
  }

  deleteItem(): void {
    const id = this.item()?.id;
    if (!id || !confirm('למחוק את התוכן?')) return;
    this.contentService.delete(id).subscribe({
      next: () => this.router.navigate([this.listRoute()]),
    });
  }
}

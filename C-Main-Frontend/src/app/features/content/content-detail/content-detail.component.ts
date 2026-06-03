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

  // ── Watch time ────────────────────────────────────────
  private watchStartTime: number | null = null;

  // ── Likes & Star ──────────────────────────────────────
  liked = false;
  likeCount = 0;
  starred = false;

  // ── Speech ────────────────────────────────────────────
  readonly speaking = signal(false);
  readonly speechLang = signal<'he-IL' | 'en-US' | 'fr-FR'>('he-IL');

  // ── Comments ──────────────────────────────────────────
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
          if (!this.auth.isAdmin()) this.watchStartTime = Date.now();
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
    const userId = this.auth.currentUser()?.id;
    if (!userId || !this.watchStartTime || this.auth.isAdmin()) return;
    const seconds = Math.floor((Date.now() - this.watchStartTime) / 1000);
    if (seconds > 0) this.userService.updateWatchTime(userId, seconds).subscribe();
  }

  // ── Watch limit ───────────────────────────────────────
  private checkWatchLimit(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId || this.auth.isAdmin()) return;
    this.userService.canWatch(userId).subscribe({
      next: (can) => this.blocked.set(!can),
    });
  }

  // ── URL helper ────────────────────────────────────────
  safeUrl(url: string): SafeResourceUrl {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  listRoute(): string {
    return this.item()?.contentType === 'Article' ? '/articles' : '/videos';
  }

  // ── Like ──────────────────────────────────────────────
  toggleLike(): void {
    const id = this.item()?.id;
    if (!id) return;
    const result = this.localData.toggleLike(id);
    this.liked = result.liked;
    this.likeCount = result.count;
  }

  // ── Star ──────────────────────────────────────────────
  toggleStar(): void {
    const id = this.item()?.id;
    if (!id) return;
    this.starred = this.localData.toggleStar(id);
  }

  // ── Speech ────────────────────────────────────────────
  toggleSpeech(): void {
    if (this.speaking()) {
      speechSynthesis.cancel();
      this.speaking.set(false);
      return;
    }
    const text = this.item()?.body ?? this.item()?.description ?? '';
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = this.speechLang();
    utter.onend = () => this.speaking.set(false);
    utter.onerror = () => this.speaking.set(false);
    speechSynthesis.speak(utter);
    this.speaking.set(true);
  }

  setSpeechLang(lang: 'he-IL' | 'en-US' | 'fr-FR'): void {
    if (this.speaking()) { speechSynthesis.cancel(); this.speaking.set(false); }
    this.speechLang.set(lang);
  }

  // ── Comments ──────────────────────────────────────────
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

  // ── Delete content ────────────────────────────────────
  deleteItem(): void {
    const id = this.item()?.id;
    if (!id || !confirm('למחוק את התוכן?')) return;
    this.contentService.delete(id).subscribe({
      next: () => this.router.navigate([this.listRoute()]),
    });
  }
}

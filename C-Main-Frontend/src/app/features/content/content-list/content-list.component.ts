import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ContentService } from '../../../core/services/content.service';
import { ContentResponse } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { LocalDataService } from '../../../core/services/local-data.service';

type SortKey = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './content-list.component.html',
  styleUrl: './content-list.component.scss',
})
export class ContentListComponent implements OnInit {
  private readonly allItems = signal<ContentResponse[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly pageTitle = signal('תוכן');
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly sortKey = signal<SortKey>('date-desc');
  readonly showStarredOnly = signal(false);

  private contentTypeFilter: string | null = null;

  readonly items = computed(() => {
    let list = this.allItems();
    if (this.showStarredOnly()) {
      const ids = this.localData.getStarredIds();
      list = list.filter((i) => ids.includes(i.id));
    }
    return this.sortItems(list, this.sortKey());
  });

  constructor(
    private readonly contentService: ContentService,
    private readonly route: ActivatedRoute,
    readonly auth: AuthService,
    readonly localData: LocalDataService,
  ) {}

  ngOnInit(): void {
    this.contentTypeFilter =
      (this.route.snapshot.data['contentTypeFilter'] as string | undefined) ?? null;
    const showStarred = this.route.snapshot.data['showStarred'] as boolean | undefined;
    if (showStarred) this.showStarredOnly.set(true);
    this.pageTitle.set(
      (this.route.snapshot.data['pageTitle'] as string | undefined) ?? 'תוכן',
    );

    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) this.searchControl.setValue(q, { emitEvent: false });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), switchMap((kw) => this.fetchContent(kw)))
      .subscribe({
        next: (data) => { this.allItems.set(this.applyTypeFilter(data)); this.loading.set(false); },
        error: () => { this.error.set('שגיאה בטעינת התוכן'); this.loading.set(false); },
      });

    this.loadInitial();
  }

  private loadInitial(): void {
    this.loading.set(true);
    this.fetchContent(this.searchControl.value.trim()).subscribe({
      next: (data) => { this.allItems.set(this.applyTypeFilter(data)); this.loading.set(false); },
      error: () => { this.error.set('שגיאה בטעינת התוכן. ודאי שהשרת רץ.'); this.loading.set(false); },
    });
  }

  private fetchContent(keyword: string) {
    const q = keyword.trim();
    return q ? this.contentService.search(q) : this.contentService.getAll();
  }

  private applyTypeFilter(data: ContentResponse[]): ContentResponse[] {
    return this.contentTypeFilter ? data.filter((i) => i.contentType === this.contentTypeFilter) : data;
  }

  private sortItems(list: ContentResponse[], key: SortKey): ContentResponse[] {
    return [...list].sort((a, b) => {
      switch (key) {
        case 'date-desc': return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'date-asc':  return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'title-asc': return a.title.localeCompare(b.title, 'he');
        case 'title-desc': return b.title.localeCompare(a.title, 'he');
      }
    });
  }

  setSort(key: SortKey): void { this.sortKey.set(key); }

  toggleStarredFilter(): void { this.showStarredOnly.update((v) => !v); }

  toggleStar(event: Event, id: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.localData.toggleStar(id);
  }

  extractYoutubeId(url: string): string {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return match ? match[1] : '';
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ContentService } from '../../../core/services/content.service';
import { ContentResponse } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './content-list.component.html',
  styleUrl: './content-list.component.scss',
})
export class ContentListComponent implements OnInit {
  readonly items = signal<ContentResponse[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly pageTitle = signal('תוכן');
  readonly searchControl = new FormControl('', { nonNullable: true });

  private contentTypeFilter: string | null = null;

  constructor(
    private readonly contentService: ContentService,
    private readonly route: ActivatedRoute,
    readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.contentTypeFilter =
      (this.route.snapshot.data['contentTypeFilter'] as string | undefined) ?? null;
    this.pageTitle.set(
      (this.route.snapshot.data['pageTitle'] as string | undefined) ?? 'תוכן',
    );

    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) {
      this.searchControl.setValue(q, { emitEvent: false });
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((keyword) => this.fetchContent(keyword)),
      )
      .subscribe({
        next: (data) => {
          this.items.set(this.applyTypeFilter(data));
          this.loading.set(false);
        },
        error: () => {
          this.error.set('שגיאה בטעינת התוכן');
          this.loading.set(false);
        },
      });

    this.loadInitial();
  }

  private loadInitial(): void {
    const keyword = this.searchControl.value.trim();
    this.loading.set(true);
    this.fetchContent(keyword).subscribe({
      next: (data) => {
        this.items.set(this.applyTypeFilter(data));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('שגיאה בטעינת התוכן. ודאי שהשרת רץ.');
        this.loading.set(false);
      },
    });
  }

  private fetchContent(keyword: string) {
    const q = keyword.trim();
    if (!q) {
      return this.contentService.getAll();
    }
    return this.contentService.search(q);
  }

  private applyTypeFilter(data: ContentResponse[]): ContentResponse[] {
    if (!this.contentTypeFilter) {
      return data;
    }
    return data.filter((item) => item.contentType === this.contentTypeFilter);
  }
}

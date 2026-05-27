import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { ContentResponse } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-content-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './content-detail.component.html',
  styleUrl: './content-detail.component.scss',
})
export class ContentDetailComponent implements OnInit {
  readonly item = signal<ContentResponse | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly contentService: ContentService,
    readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('מזהה לא תקין');
      this.loading.set(false);
      return;
    }
    this.contentService.getById(id).subscribe({
      next: (data) => {
        this.item.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('התוכן לא נמצא');
        this.loading.set(false);
      },
    });
  }

  listRoute(): string {
    const type = this.item()?.contentType;
    if (type === 'Article') {
      return '/articles';
    }
    return '/videos';
  }

  deleteItem(): void {
    const id = this.item()?.id;
    if (!id || !confirm('למחוק את התוכן?')) {
      return;
    }
    this.contentService.delete(id).subscribe({
      next: () => this.router.navigate([this.listRoute()]),
    });
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';

@Component({
  selector: 'app-content-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './content-form.component.html',
  styleUrl: './content-form.component.scss',
})
export class ContentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contentService = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  private contentId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    contentType: ['Video', Validators.required],
    videoUrl: [''],
    durationSeconds: [0],
    body: [''],
    thumbnailUrl: [''],
  });

  ngOnInit(): void {
    this.contentId = this.route.snapshot.paramMap.get('id');
    if (this.contentId) {
      this.isEdit.set(true);
      this.contentService.getById(this.contentId).subscribe({
        next: (c) => {
          this.form.patchValue({
            title: c.title,
            description: c.description,
            contentType: c.contentType,
            videoUrl: c.videoUrl ?? '',
            durationSeconds: c.durationSeconds ?? 0,
            body: c.body ?? '',
            thumbnailUrl: c.thumbnailUrl ?? '',
          });
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      title: raw.title,
      description: raw.description,
      contentType: raw.contentType,
      videoUrl: raw.contentType === 'Video' ? raw.videoUrl || undefined : undefined,
      durationSeconds:
        raw.contentType === 'Video' ? Number(raw.durationSeconds) || undefined : undefined,
      body: raw.contentType === 'Article' ? raw.body || undefined : undefined,
      thumbnailUrl: raw.thumbnailUrl || undefined,
    };

    this.loading.set(true);
    this.error.set(null);

    const req =
      this.isEdit() && this.contentId
        ? this.contentService.update(this.contentId, payload)
        : this.contentService.add(payload);

    req.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/videos']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('שמירה נכשלה');
      },
    });
  }
}

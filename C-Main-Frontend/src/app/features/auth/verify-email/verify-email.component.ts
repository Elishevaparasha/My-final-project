import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
  readonly message = signal('מאמתים את המייל...');
  readonly isError = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.isError.set(true);
      this.message.set('קישור לא תקין');
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: (msg) => {
        this.message.set(typeof msg === 'string' ? msg : 'המייל אומת בהצלחה');
      },
      error: (err) => {
        this.isError.set(true);
        this.message.set(err.error ?? 'הקישור אינו תקין או פג תוקף');
      },
    });
  }
}

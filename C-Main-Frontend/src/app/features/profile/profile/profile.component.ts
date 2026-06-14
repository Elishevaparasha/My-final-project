import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { WatchTimePipe } from '../../../core/utils/watch-time.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, WatchTimePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);

  readonly profile = computed(() => this.auth.currentUser());
  readonly canWatch = signal<boolean | null>(null);
  readonly pwdMessage = signal<string | null>(null);
  readonly pwdError = signal<string | null>(null);
  readonly subscribing = signal(false);
  readonly subMessage = signal<string | null>(null);
  readonly subError = signal<string | null>(null);
  readonly showCreditForm = signal(false);

  readonly watchPercent = computed(() => {
    const sec = this.profile()?.monthlyWatchedSeconds ?? 0;
    return Math.min(100, Math.round((sec / 108000) * 100));
  });

  readonly passwordForm = this.fb.nonNullable.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly creditForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.minLength(16)]],
    expiry: ['', [Validators.required, Validators.minLength(5)]],
    cvv: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    // שלח זמן צפייה שלא נשלח עדיין (בגלל ביטול HTTP בזמן ngOnDestroy)
    const pending = Number(localStorage.getItem('pending_watch_seconds') ?? 0);
    const pendingUserId = localStorage.getItem('pending_watch_user_id');
    if (pending > 0 && pendingUserId === user.id) {
      localStorage.removeItem('pending_watch_seconds');
      localStorage.removeItem('pending_watch_user_id');
      this.userService.updateWatchTime(user.id, pending).subscribe({
        next: () => {
          this.userService.getById(user.id).subscribe({
            next: (data) => this.auth.updateStoredUser(data),
          });
        },
      });
    } else {
      this.userService.getById(user.id).subscribe({
        next: (data) => this.auth.updateStoredUser(data),
      });
    }

    this.userService.canWatch(user.id).subscribe({
      next: (v) => this.canWatch.set(v),
    });
  }

  subscribe(): void {
    if (this.creditForm.invalid) { this.creditForm.markAllAsTouched(); return; }
    const user = this.auth.currentUser();
    if (!user) return;
    this.subscribing.set(true);
    this.subError.set(null);
    // Simulate payment processing
    setTimeout(() => {
      this.userService.updateSubscription(user.id, true).subscribe({
        next: () => {
          this.subscribing.set(false);
          this.subMessage.set('המנוי הופעל בהצלחה!');
          this.showCreditForm.set(false);
          this.userService.getById(user.id).subscribe((data) => {
            this.auth.updateStoredUser(data);
          });
        },
        error: () => {
          this.subscribing.set(false);
          this.subError.set('שגיאה בעיבוד התשלום, נסי שוב');
        },
      });
    }, 1500);
  }

  cancelSubscription(): void {
    const user = this.auth.currentUser();
    if (!user || !confirm('לבטל את המנוי?')) return;
    this.subscribing.set(true);
    this.userService.cancelSubscription(user.id).subscribe({
      next: () => {
        this.subscribing.set(false);
        this.userService.getById(user.id).subscribe((data) => {
          this.auth.updateStoredUser(data);
        });
      },
      error: () => this.subscribing.set(false),
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const user = this.auth.currentUser();
    if (!user) return;
    const { oldPassword, newPassword } = this.passwordForm.getRawValue();
    this.userService.changePassword({ email: user.email, oldPassword, newPassword }).subscribe({
      next: (msg) => {
        this.pwdMessage.set(typeof msg === 'string' ? msg : 'הסיסמה שונתה בהצלחה');
        this.pwdError.set(null);
        this.passwordForm.reset();
      },
      error: (err) => {
        this.pwdError.set(err.error ?? 'הסיסמה הישנה שגויה');
        this.pwdMessage.set(null);
      },
    });
  }
}

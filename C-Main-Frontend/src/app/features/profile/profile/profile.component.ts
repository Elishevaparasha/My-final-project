import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { UserResponse } from '../../../core/models/api.models';
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

  readonly profile = signal<UserResponse | null>(null);
  readonly canWatch = signal<boolean | null>(null);
  readonly pwdMessage = signal<string | null>(null);
  readonly pwdError = signal<string | null>(null);

  readonly passwordForm = this.fb.nonNullable.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) {
      return;
    }
    this.userService.getById(user.id).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.auth.updateStoredUser(data);
      },
    });
    this.userService.canWatch(user.id).subscribe({
      next: (v) => this.canWatch.set(v),
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const user = this.auth.currentUser();
    if (!user) {
      return;
    }
    const { oldPassword, newPassword } = this.passwordForm.getRawValue();
    this.userService
      .changePassword({ email: user.email, oldPassword, newPassword })
      .subscribe({
        next: (msg) => {
          this.pwdMessage.set(typeof msg === 'string' ? msg : 'הסיסמה שונתה');
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

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loading = signal(false);
  readonly sending = signal(false);
  readonly codeSent = signal(false);

  readonly form = this.fb.nonNullable.group({
    resetToken: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    const email = (this.route.snapshot.queryParamMap.get('email') ?? '').trim();
    if (!email) {
      this.error.set('הזיני קודם אימייל במסך ההתחברות, ואז לחצי על שכחתי סיסמה.');
      return;
    }
    this.email.set(email);
    this.sendCode();
  }

  sendCode(): void {
    const email = this.email();
    if (!email) return;

    this.sending.set(true);
    this.error.set(null);
    this.userService.requestPasswordReset({ email }).subscribe({
      next: () => {
        this.sending.set(false);
        this.codeSent.set(true);
        this.success.set(`נשלח קוד למייל ${email}. בדקי גם בספאם.`);
      },
      error: (err) => {
        this.sending.set(false);
        this.error.set(getApiErrorMessage(err, 'שליחת הקוד נכשלה'));
      },
    });
  }

  resend(): void {
    this.success.set(null);
    this.form.controls.resetToken.reset('');
    this.sendCode();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.userService
      .forgotPassword({
        email: this.email(),
        ...this.form.getRawValue(),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('הסיסמה שונתה בהצלחה! מעבירים להתחברות...');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(getApiErrorMessage(err, 'הקוד שגוי או שפג תוקפו'));
        },
      });
  }
}

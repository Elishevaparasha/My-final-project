import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-subscribe',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="subscribe-page">
      <h1>הצטרפות למנוי פרימיום</h1>
      
      @if (auth.currentUser()?.isSubscriber) {
        <div class="subscribed-banner">
          <h2>🎉 אתה כבר מנוי פרימיום!</h2>
          <p>תודה שאתה תומך בנו</p>
        </div>
      } @else {
        <div class="plans">
          <div class="plan free">
            <h2>חינם</h2>
            <p class="price">₪0</p>
            <ul>
              <li>✅ גישה לכל התוכן</li>
              <li>❌ הגבלה ל-30 שעות צפייה בחודש</li>
              <li>✅ שמירת תוכן לאחר מכן</li>
            </ul>
          </div>
          
          <div class="plan premium">
            <h2>פרימיום</h2>
            <p class="price">₪10<small>/חודש</small></p>
            <ul>
              <li>✅ גישה לכל התוכן ללא הגבלה</li>
              <li>✅ צפייה בלתי מוגבלת</li>
              <li>✅ שמירה לרשימת השמורים</li>
              <li>✅ תמיכה באתר</li>
            </ul>
            <button class="btn btn-primary" (click)="subscribe()" [disabled]="loading()">
              {{ loading() ? 'מעבד...' : 'שדרג עכשיו' }}
            </button>
          </div>
        </div>
        
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        @if (success()) {
          <p class="success">{{ success() }}</p>
        }
      }
      
      <a routerLink="/profile" class="back-link">← חזרה לפרופיל</a>
    </div>
  `,
  styles: [`
    .subscribe-page { padding: 2rem; max-width: 900px; margin: 0 auto; }
    h1 { text-align: center; color: #fff; margin-bottom: 2rem; }
    .plans { display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; }
    .plan { 
      background: #1e40af; border-radius: 12px; padding: 2rem; 
      width: 300px; text-align: center; color: #fff;
    }
    .plan.premium { border: 3px solid #fbbf24; }
    .price { font-size: 2.5rem; font-weight: bold; margin: 1rem 0; }
    .price small { font-size: 1rem; }
    ul { list-style: none; padding: 0; text-align: right; }
    li { padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .subscribed-banner { 
      background: linear-gradient(135deg, #10b981, #059669); 
      padding: 2rem; border-radius: 12px; text-align: center; color: #fff;
    }
    .error { color: #f87171; text-align: center; margin-top: 1rem; }
    .success { color: #4ade80; text-align: center; margin-top: 1rem; }
    .back-link { display: block; text-align: center; margin-top: 2rem; color: #93c5fd; }
  `]
})
export class SubscribeComponent {
  readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  
  subscribe(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    
    this.loading.set(true);
    this.error.set(null);
    
    this.userService.subscribe(user.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('ברכות! הפכת למנוי פרימיום!');
        const updatedUser = { ...user, isSubscriber: true };
        this.auth.updateStoredUser(updatedUser);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('שגיאה בהרשמה למנוי. נסה שוב מאוחר יותר.');
      }
    });
  }
}
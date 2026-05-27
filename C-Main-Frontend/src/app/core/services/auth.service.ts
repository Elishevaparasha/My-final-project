import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Role,
  UserResponse,
} from '../models/api.models';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/User`;

  private readonly userSignal = signal<UserResponse | null>(this.loadUser());

  readonly currentUser = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.userSignal());
  readonly isAdmin = computed(() => this.userSignal()?.role === Role.Admin);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((res) => this.persistSession(res.token, res.user)),
    );
  }

  register(request: RegisterRequest) {
    return this.http.post<UserResponse>(`${this.baseUrl}/register`, request);
  }

  verifyEmail(token: string) {
    return this.http.get(`${this.baseUrl}/verify-email/${token}`, {
      responseType: 'text',
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  updateStoredUser(user: UserResponse): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  private persistSession(token: string, user: UserResponse): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  private loadUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      return null;
    }
  }
}

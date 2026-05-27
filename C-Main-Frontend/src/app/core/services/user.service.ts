import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  UserResponse,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/User`;

  constructor(private readonly http: HttpClient) {}

  getAll() {
    return this.http.get<UserResponse[]>(this.baseUrl);
  }

  getById(id: string) {
    return this.http.get<UserResponse>(`${this.baseUrl}/${id}`);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  updateSubscription(id: string, isSubscriber: boolean) {
    return this.http.put(`${this.baseUrl}/subscription/${id}`, isSubscriber, {
      responseType: 'text',
    });
  }

  makeAdmin(id: string) {
    return this.http.put(`${this.baseUrl}/make-admin/${id}`, null, {
      responseType: 'text',
    });
  }

  canWatch(id: string) {
    return this.http.get<boolean>(`${this.baseUrl}/can-watch/${id}`);
  }

  updateWatchTime(id: string, seconds: number) {
    return this.http.put(`${this.baseUrl}/watch-time/${id}`, seconds);
  }

  changePassword(request: ChangePasswordRequest) {
    return this.http.post(`${this.baseUrl}/change-password`, request, {
      responseType: 'text',
    });
  }

  forgotPassword(request: ForgotPasswordRequest) {
    return this.http.post(`${this.baseUrl}/forgot-password`, request, {
      responseType: 'text',
    });
  }
}

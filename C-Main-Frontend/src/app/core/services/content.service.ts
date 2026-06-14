import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContentRequest, ContentResponse, Comment } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly baseUrl = `${environment.apiUrl}/content`;

  constructor(private readonly http: HttpClient) {}

  getAll() {
    return this.http.get<ContentResponse[]>(this.baseUrl);
  }

  getById(id: string) {
    return this.http.get<ContentResponse>(`${this.baseUrl}/${id}`);
  }

  search(keyword: string) {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<ContentResponse[]>(`${this.baseUrl}/search`, { params });
  }

  add(request: ContentRequest) {
    return this.http.post(this.baseUrl, request);
  }

  update(id: string, request: ContentRequest) {
    return this.http.put(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // ── Translation for TTS ─────────────────────────────────
  translate(text: string, targetLang: string): Observable<string> {
    return this.http.post<{ translatedText: string }>(
      `${this.baseUrl}/translate`,
      { text, targetLang }
    ).pipe(map(res => res.translatedText));
  }

  // ── Comments (backend) ──────────────────────────────────
  getComments(contentId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/${contentId}/comments`);
  }

  addComment(contentId: string, text: string, parentId?: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/${contentId}/comments`, { text, parentId });
  }

  deleteComment(contentId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${contentId}/comments/${commentId}`);
  }
}

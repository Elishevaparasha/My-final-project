import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ContentRequest, ContentResponse } from '../models/api.models';

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
}

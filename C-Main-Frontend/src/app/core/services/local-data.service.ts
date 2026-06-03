import { Injectable } from '@angular/core';

export interface Comment {
  id: string;
  contentId: string;
  parentId: string | null;
  authorName: string;
  text: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class LocalDataService {
  // ── Likes ──────────────────────────────────────────────
  getLikes(contentId: string): number {
    return Number(localStorage.getItem(`likes_${contentId}`) ?? 0);
  }
  hasLiked(contentId: string): boolean {
    return localStorage.getItem(`liked_${contentId}`) === '1';
  }
  toggleLike(contentId: string): { liked: boolean; count: number } {
    const liked = !this.hasLiked(contentId);
    const count = this.getLikes(contentId) + (liked ? 1 : -1);
    localStorage.setItem(`liked_${contentId}`, liked ? '1' : '0');
    localStorage.setItem(`likes_${contentId}`, String(Math.max(0, count)));
    return { liked, count };
  }

  // ── Starred / Watchlist ────────────────────────────────
  isStarred(contentId: string): boolean {
    return localStorage.getItem(`star_${contentId}`) === '1';
  }
  toggleStar(contentId: string): boolean {
    const starred = !this.isStarred(contentId);
    localStorage.setItem(`star_${contentId}`, starred ? '1' : '0');
    return starred;
  }
  getStarredIds(): string[] {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith('star_') && localStorage.getItem(k) === '1')
      .map((k) => k.replace('star_', ''));
  }

  // ── Comments ───────────────────────────────────────────
  getComments(contentId: string): Comment[] {
    const raw = localStorage.getItem(`comments_${contentId}`);
    return raw ? JSON.parse(raw) : [];
  }
  addComment(contentId: string, text: string, authorName: string, parentId: string | null = null): Comment {
    const comments = this.getComments(contentId);
    const comment: Comment = {
      id: crypto.randomUUID(),
      contentId,
      parentId,
      authorName,
      text,
      createdAt: new Date().toISOString(),
    };
    comments.push(comment);
    localStorage.setItem(`comments_${contentId}`, JSON.stringify(comments));
    return comment;
  }
  deleteComment(contentId: string, commentId: string): void {
    const all = this.getComments(contentId).filter(
      (c) => c.id !== commentId && c.parentId !== commentId,
    );
    localStorage.setItem(`comments_${contentId}`, JSON.stringify(all));
  }
}

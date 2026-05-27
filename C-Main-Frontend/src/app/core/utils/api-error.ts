import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(
  err: unknown,
  fallback = 'שגיאה. ודאי שהבקאנד רץ על http://localhost:5117',
): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'לא ניתן להתחבר לשרת. ודאי שהבקאנד רץ (dotnet run) וש-CORS מופעל.';
    }
    const body = err.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object' && 'message' in body) {
      return String((body as { message: string }).message);
    }
    if (err.message) {
      return err.message;
    }
  }
  if (err instanceof ProgressEvent) {
    return 'שגיאת רשת — הבקאנד לא זמין או לא מגיב.';
  }
  if (typeof err === 'string') {
    return err;
  }
  return fallback;
}

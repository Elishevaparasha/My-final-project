import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'watchTime', standalone: true })
export class WatchTimePipe implements PipeTransform {
  transform(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m} דקות מתוך 30 שעות בחודש`;
    return `${h} שעות ו-${m} דקות מתוך 30 שעות בחודש`;
  }
}

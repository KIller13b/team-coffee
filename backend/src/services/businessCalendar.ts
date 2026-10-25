import fs from 'fs';
import path from 'path';

export class BusinessCalendar {
  public holidays: Set<string> = new Set();
  public holidayDetails: Record<string, string>[] = [];

  constructor(holidaysFile?: string) {
    if (holidaysFile && fs.existsSync(holidaysFile)) {
      this.loadHolidays(holidaysFile);
    } else {
      const defaultPath = path.resolve(
        __dirname,
        '../../../odin_data/bundle/data/holidays.csv'
      );
      if (fs.existsSync(defaultPath)) {
        this.loadHolidays(defaultPath);
      } else {
        // Fallback standard holidays 2026-2027
        const defaults = [
          '2026-11-28',
          '2026-11-29',
          '2026-12-24',
          '2026-12-25',
          '2026-12-31',
          '2027-01-01',
          '2027-01-20',
          '2027-02-17',
          '2027-05-31',
          '2027-07-05',
        ];
        defaults.forEach((d) => this.holidays.add(d));
      }
    }
  }

  private loadHolidays(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      if (lines.length <= 1) return;

      const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const dateIdx = header.indexOf('date');

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map((c) => c.trim());
        const d = dateIdx >= 0 ? cols[dateIdx] : cols[0];
        if (d) {
          this.holidays.add(d);
          const detail: Record<string, string> = {};
          header.forEach((h, idx) => {
            detail[h] = cols[idx] || '';
          });
          this.holidayDetails.push(detail);
        }
      }
    } catch (err: any) {
      console.warn(`[BusinessCalendar] Could not load holidays file at ${filePath}:`, err.message);
    }
  }

  public isBusinessDay(d: Date): boolean {
    const dayOfWeek = d.getUTCDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }
    const isoDate = d.toISOString().split('T')[0];
    if (this.holidays.has(isoDate)) {
      return false;
    }
    return true;
  }

  public addBusinessDays(startDate: Date, businessDays: number): Date {
    const current = new Date(startDate.getTime());
    let added = 0;
    while (added < businessDays) {
      current.setUTCDate(current.getUTCDate() + 1);
      if (this.isBusinessDay(current)) {
        added++;
      }
    }
    return current;
  }

  public countBusinessDays(startDate: Date, endDate: Date): number {
    if (startDate >= endDate) {
      return 0;
    }
    const current = new Date(startDate.getTime());
    current.setUTCDate(current.getUTCDate() + 1);
    let count = 0;
    while (current <= endDate) {
      if (this.isBusinessDay(current)) {
        count++;
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return count;
  }

  public static isBusinessDay(d: string | Date): boolean {
    const dateObj = typeof d === 'string' ? new Date(`${d.slice(0, 10)}T00:00:00Z`) : d;
    return calendar.isBusinessDay(dateObj);
  }

  public static addBusinessDays(startDate: string | Date, businessDays: number): string {
    const startObj = typeof startDate === 'string' ? new Date(`${startDate.slice(0, 10)}T00:00:00Z`) : startDate;
    const res = calendar.addBusinessDays(startObj, businessDays);
    return res.toISOString().slice(0, 10);
  }

  public static businessDaysBetween(startDate: string | Date, endDate: string | Date): number {
    const startObj = typeof startDate === 'string' ? new Date(`${startDate.slice(0, 10)}T00:00:00Z`) : startDate;
    const endObj = typeof endDate === 'string' ? new Date(`${endDate.slice(0, 10)}T00:00:00Z`) : endDate;
    return calendar.countBusinessDays(startObj, endObj);
  }
}

export const calendar = new BusinessCalendar();

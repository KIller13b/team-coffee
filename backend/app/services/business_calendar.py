"""
Business Calendar Service for Odin Multi-Agent Contract Intelligence.
Parses holidays from odin_data/bundle/data/holidays.csv and computes exact business days
for notice periods, deemed acceptance windows, and SLA claim cutoffs.
"""

import os
import csv
from datetime import datetime, date, timedelta
from typing import Set, List, Optional


class BusinessCalendar:
    def __init__(self, holidays_file: Optional[str] = None):
        self.holidays: Set[str] = set()
        self.holiday_details: List[dict] = []
        if holidays_file and os.path.exists(holidays_file):
            self._load_holidays(holidays_file)
        else:
            default_path = os.path.abspath(os.path.join(
                os.path.dirname(__file__), "..", "..", "..", "odin_data", "bundle", "data", "holidays.csv"
            ))
            if os.path.exists(default_path):
                self._load_holidays(default_path)
            else:
                # Standard fallback observed holidays (2026-2027)
                self.holidays = {
                    "2026-11-28", "2026-11-29", "2026-12-24", "2026-12-25",
                    "2026-12-31", "2027-01-01", "2027-01-20", "2027-02-17",
                    "2027-05-31", "2027-07-05"
                }

    def _load_holidays(self, path: str):
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                d = row.get("date", "").strip()
                if d:
                    self.holidays.add(d)
                    self.holiday_details.append(row)

    def is_business_day(self, target_date: date) -> bool:
        """Saturday (5) and Sunday (6) are non-business days; holidays are excluded."""
        if target_date.weekday() >= 5:
            return False
        if target_date.strftime("%Y-%m-%d") in self.holidays:
            return False
        return True

    def add_business_days(self, start_date: date, business_days: int) -> date:
        """
        Adds n business days to start_date, skipping weekends and observed holidays.
        Matches exact contractual definitions (e.g. Pixelwright D1 §4.2 10-business-day review).
        """
        current = start_date
        added = 0
        while added < business_days:
            current += timedelta(days=1)
            if self.is_business_day(current):
                added += 1
        return current

    def count_business_days(self, start_date: date, end_date: date) -> int:
        """Returns the number of business days between start_date and end_date."""
        if start_date > end_date:
            return 0
        current = start_date
        count = 0
        while current <= end_date:
            if self.is_business_day(current):
                count += 1
            current += timedelta(days=1)
        return count


# Global singleton instance
calendar = BusinessCalendar()

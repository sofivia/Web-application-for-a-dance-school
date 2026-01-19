from datetime import date, timedelta


def weekdays(weekday, date_from: date, date_to: date) -> list[date]:
    current = date_from + timedelta(days=(weekday - date_from.weekday()) % 7)
    dates = []
    while current <= date_to:
        dates.append(current)
        current += timedelta(days=7)
    return dates

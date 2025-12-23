export function getWeekday(daynr: number, locale='pl-PL') {
    const date = new Date(2024, 0, daynr); // Jan 2024 started on a Monday
    return date.toLocaleDateString(locale, { weekday: 'long' });
}

export function getHour(hours: string, locale='pl-PL') {
    const date = new Date(`1970-01-01T${hours}`);
    return new Intl.DateTimeFormat(locale, {hour: '2-digit', minute: '2-digit'})
        .format(date);
}

export function dateToISOday(date: Date) {
    return date.toISOString().split('T')[0];
}

export function formatDate(date: Date, locale='pl-PL') {
    return new Intl.DateTimeFormat(locale, {day: '2-digit', month: '2-digit', year: 'numeric'}).format(date);
}

export function fromISO(isoDateTime: string) {
    return new Date(Date.parse(isoDateTime));
}
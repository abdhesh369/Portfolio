/**
 * Centralized date utility to ensure consistent date/time rendering across the application
 * and prevent timezone drift or locale inconsistencies.
 */

const DEFAULT_LOCALE = 'en-US';

export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
    includeTime?: boolean;
}

/**
 * Formats a date string or object consistently.
 * Uses 'en-US' as the base locale for structure, but allows overrides.
 */
export function formatDate(
    date: string | number | Date,
    options: DateFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(d.getTime())) return 'Invalid Date';

    const { includeTime, ...intlOptions } = options;

    const finalOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'UTC', // Default to UTC
        ...intlOptions
    };

    if (includeTime) {
        return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
            hour: '2-digit',
            minute: '2-digit',
            ...finalOptions,
        }).format(d);
    }

    return new Intl.DateTimeFormat(DEFAULT_LOCALE, finalOptions).format(d);
}

/**
 * Formats time only.
 */
export function formatTime(date: string | number | Date): string {
    return formatDate(date, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        includeTime: true
    });
}

/**
 * Simple compact date (e.g., 10/03/24)
 */
export function formatCompactDate(date: string | number | Date): string {
    return formatDate(date, {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
    });
}

/**
 * Returns a human-friendly "time ago" string.
 */
export function formatTimeAgo(date: string | number | Date): string {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid date';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();

    if (diffMs < 0) {
        const absDiffMs = Math.abs(diffMs);
        const absDiffMin = Math.floor(absDiffMs / 60000);
        const absDiffHr = Math.floor(absDiffMs / 3600000);
        const absDiffDays = Math.floor(absDiffMs / 86400000);

        if (absDiffMin < 60) return `in ${absDiffMin}m`;
        if (absDiffHr < 24) return `in ${absDiffHr}h`;
        if (absDiffDays === 1) return "Tomorrow";
        return `in ${absDiffDays}d`;
    }

    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
}

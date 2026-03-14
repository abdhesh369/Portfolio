/**
 * Utility for escaping special characters to HTML entities.
 * Used to prevent HTML injection in emails and other templated outputs.
 */
export function escapeHtml(text: string): string {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

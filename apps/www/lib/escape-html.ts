/**
 * Escape text for safe insertion into HTML (e.g. Shiki fallback when highlighting fails).
 * Trusted Shiki output does not need this; use for error paths or untrusted snippets only.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

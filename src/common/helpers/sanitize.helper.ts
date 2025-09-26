export function sanitizeText(value: any): string {
  if (!value) return '';
  return String(value)
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '')
    .trim();
}

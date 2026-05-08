/**
 * Parse question_img or answer_img JSON array string to get the first URL.
 * DB stores these as: '["https://..."]'
 */
export function parseImageUrl(jsonArrayString: string | null | undefined): string | null {
  if (!jsonArrayString) return null;
  try {
    const arr = JSON.parse(jsonArrayString);
    if (Array.isArray(arr) && arr.length > 0) {
      return arr[0] as string;
    }
    return null;
  } catch {
    // Maybe it's already a plain URL (fallback)
    if (jsonArrayString.startsWith("http")) return jsonArrayString;
    return null;
  }
}

/**
 * Convert component display name to URL slug
 * "Pure 1" → "pure-1", "Stats 2" → "stats-2"
 */
export function componentToSlug(component: string): string {
  return component.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Convert URL slug back to display name
 * "pure-1" → "Pure 1"
 */
export function slugToComponent(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Shuffle array in place using Fisher-Yates */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Format a number with comma separators */
export function formatCount(n: number): string {
  return n.toLocaleString();
}

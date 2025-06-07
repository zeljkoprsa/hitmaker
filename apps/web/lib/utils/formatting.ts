/**
 * Format a date string into a human-readable format
 */
export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}): string {
  const date = new Date(dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Calculate reading time for a piece of content
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Create a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Truncate a string to a specific length and add ellipsis if needed
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  
  return text.slice(0, length) + '...';
}

/**
 * Generate canonical URL for a page
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = 'https://tryuseless.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}


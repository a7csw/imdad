export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueSlug(base: string): string {
  const timestamp = Date.now().toString(36);
  return `${slugify(base)}-${timestamp}`;
}

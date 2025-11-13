export function enforceTweetLength(text: string) {
  return text.length > 280 ? text.slice(0, 280) : text;
}

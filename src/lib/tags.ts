export function extractTags(content: string) {
  const tags = content.match(/#\w+/g) ?? [];
  return [...new Set(tags.map((tag) => tag.replace("#", "")))];
}

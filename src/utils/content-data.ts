export interface ContentData {
  id: string;
  name: string;
  metadata: Record<string, string>;
}

export function metadataLabel(key: string): string {
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function matchesContent(item: ContentData, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  return [item.id, item.name, ...Object.keys(item.metadata), ...Object.values(item.metadata)]
    .some(value => value.toLowerCase().includes(normalized));
}

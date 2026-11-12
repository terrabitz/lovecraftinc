export type MetadataRow = { key: string; value: string };

export function parseMetadata(value: unknown): MetadataRow[] {
  if (value === undefined) return [];
  if (value === null || typeof value !== 'object' || Array.isArray(value) || value instanceof Date) {
    throw new Error('Metadata must be an object containing text key-value pairs.');
  }
  return Object.entries(value).map(([key, value]) => {
    if (!key.trim() || typeof value !== 'string') {
      throw new Error('Metadata keys must not be blank and values must be text.');
    }
    return { key, value };
  });
}

export function serializeMetadata(rows: MetadataRow[]): Record<string, string> {
  const error = metadataError(rows);
  if (error) throw new Error(error);
  return Object.fromEntries(rows.map(row => [row.key, row.value]));
}

export function metadataError(rows: MetadataRow[]): string | undefined {
  const keys = new Set<string>();
  for (const row of rows) {
    if (!row.key.trim()) return 'Metadata keys must not be blank.';
    if (keys.has(row.key)) return `Duplicate metadata key: ${row.key}`;
    keys.add(row.key);
  }
}

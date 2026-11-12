import { getCollection } from 'astro:content';
import { contentTypes } from '../content-types';
import type { SearchResult } from '../types/search';

export type { SearchResult };

export async function getAllSearchableContent(): Promise<SearchResult[]> {
  const results = await Promise.all(contentTypes.map(async type => {
    const entries = await getCollection(type.slug);
    return entries.map(entry => ({
      id: entry.data.id,
      title: entry.data.name,
      url: `/${type.slug}/${entry.data.id.toUpperCase()}`,
      type: type.singular.toLowerCase(),
      content: [
        entry.body || '',
        ...Object.entries(entry.data.metadata).map(([key, value]) => `${key}: ${value}`),
      ].join('\n'),
    }));
  }));
  return results.flat();
}

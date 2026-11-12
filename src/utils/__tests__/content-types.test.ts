import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it, vi } from 'vitest';
import { contentTypes, getArticleTypes, mapContentTypes } from '../../content-types';
import { collections } from '../../content.config';
import keystatic from '../../../keystatic.config';
import { getAllSearchableContent } from '../searchContent';

vi.mock('astro:content', async () => {
  const { z } = await import('astro/zod');
  return {
    z,
    defineCollection: (options: unknown) => options,
    getCollection: async (slug: string) => [{
      data: { id: `${slug}-001`, name: `${slug} record`, metadata: { arbitrary: 'Searchable value' } },
      body: 'Article content',
    }],
  };
});

describe('content type configuration', () => {
  it('derives Astro and CMS collections and article links from the same registry', () => {
    const slugs = contentTypes.map(type => type.slug);
    expect(Object.keys(collections)).toEqual(slugs);
    expect(Object.keys(keystatic.collections)).toEqual(slugs);
    expect(Object.keys(mapContentTypes(type => type.label))).toEqual(slugs);
    expect(getArticleTypes().map(type => type.contentPath)).toEqual(slugs);
    for (const type of contentTypes) {
      expect(Object.keys(keystatic.collections[type.slug].schema)).toEqual(['id', 'name', 'metadata', 'content']);
      expect(keystatic.collections[type.slug].path).toBe(`src/content/${type.slug}/*`);
    }
  });

  it('loads every migrated record with only the standardized frontmatter', () => {
    for (const type of contentTypes) {
      const directory = join(process.cwd(), 'src/content', type.slug);
      const schema = collections[type.slug].schema;
      if (!schema || typeof schema === 'function') throw new Error('Expected an object schema');
      for (const file of readdirSync(directory).filter(file => file.endsWith('.mdoc'))) {
        const { data } = matter(readFileSync(join(directory, file), 'utf8'));
        expect(Object.keys(data).sort()).toEqual(['id', 'metadata', 'name']);
        expect(schema.parse(data)).toEqual(data);
        const cms = keystatic.collections[type.slug].schema.metadata;
        expect(cms.serialize(cms.parse(data.metadata)).value).toEqual(data.metadata);
      }
    }
  });

  it('rejects legacy top-level fields, non-text metadata, and mismatched IDs', () => {
    const schema = collections.anomalies.schema;
    if (!schema || typeof schema === 'function') throw new Error('Expected an object schema');
    const record = { id: 'EID-001', name: 'Door' };
    expect(schema.parse(record).metadata).toEqual({});
    expect(schema.safeParse({ ...record, status: 'Contained' }).success).toBe(false);
    expect(schema.safeParse({ ...record, metadata: { count: 5 } }).success).toBe(false);
    expect(schema.safeParse({ ...record, metadata: { ' ': 'blank' } }).success).toBe(false);
    expect(schema.safeParse({ ...record, id: 'EID-EMP-001' }).success).toBe(false);
  });

  it('includes every configured type and its metadata in global search', async () => {
    const results = await getAllSearchableContent();
    expect(results).toHaveLength(contentTypes.length);
    contentTypes.forEach((type, i) => {
      expect(results[i]).toMatchObject({
        url: `/${type.slug}/${type.slug.toUpperCase()}-001`,
        type: type.singular.toLowerCase(),
      });
      expect(results[i].content).toContain('arbitrary: Searchable value');
    });
  });
});

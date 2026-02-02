import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadValidIds } from '../id-loader.js';
import type { ArticleTypeConfig } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

const testArticleTypes: ArticleTypeConfig[] = [
  {
    pattern: /EID-EMP-\d{3}/,
    idField: 'employeeId',
    urlPrefix: '/employees',
    contentPath: 'employees',
  },
  {
    pattern: /EID-ORG-\d{3}/,
    idField: 'orgId',
    urlPrefix: '/organizations',
    contentPath: 'organizations',
  },
  {
    pattern: /EID-\d{3}/,
    idField: 'anomalyId',
    urlPrefix: '/anomalies',
    contentPath: 'anomalies',
  },
];

describe('loadValidIds', () => {
  it('loads IDs from all content directories', () => {
    const validIds = loadValidIds(fixturesDir, testArticleTypes);

    expect(validIds.has('EID-001')).toBe(true);
    expect(validIds.has('EID-002')).toBe(true);
    expect(validIds.has('EID-EMP-001')).toBe(true);
    expect(validIds.has('EID-ORG-001')).toBe(true);
  });

  it('returns uppercased IDs', () => {
    const validIds = loadValidIds(fixturesDir, testArticleTypes);
    for (const id of validIds) {
      expect(id).toBe(id.toUpperCase());
    }
  });

  it('returns empty set for non-existent directory', () => {
    const validIds = loadValidIds('/non/existent/path', testArticleTypes);
    expect(validIds.size).toBe(0);
  });

  it('ignores files without matching ID field in frontmatter', () => {
    const limitedTypes: ArticleTypeConfig[] = [
      {
        pattern: /EID-\d{3}/,
        idField: 'nonExistentField',
        urlPrefix: '/anomalies',
        contentPath: 'anomalies',
      },
    ];
    const validIds = loadValidIds(fixturesDir, limitedTypes);
    expect(validIds.size).toBe(0);
  });

  it('loads only specified content paths', () => {
    const anomaliesOnly: ArticleTypeConfig[] = [
      {
        pattern: /EID-\d{3}/,
        idField: 'anomalyId',
        urlPrefix: '/anomalies',
        contentPath: 'anomalies',
      },
    ];
    const validIds = loadValidIds(fixturesDir, anomaliesOnly);

    expect(validIds.has('EID-001')).toBe(true);
    expect(validIds.has('EID-002')).toBe(true);
    expect(validIds.has('EID-EMP-001')).toBe(false);
    expect(validIds.has('EID-ORG-001')).toBe(false);
  });
});

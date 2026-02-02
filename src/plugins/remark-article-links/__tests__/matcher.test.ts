import { describe, it, expect } from 'vitest';
import {
  resolveArticleType,
  buildArticleUrl,
  findArticleReferences,
} from '../matcher.js';
import type { ArticleTypeConfig } from '../types.js';

const testArticleTypes: ArticleTypeConfig[] = [
  {
    pattern: /EID-EMP-\d{3}/,
    idField: 'employeeId',
    titleField: 'name',
    urlPrefix: '/employees',
    contentPath: 'employees',
  },
  {
    pattern: /EID-ORG-\d{3}/,
    idField: 'orgId',
    titleField: 'name',
    urlPrefix: '/organizations',
    contentPath: 'organizations',
  },
  {
    pattern: /EID-\d{3}/,
    idField: 'anomalyId',
    titleField: 'title',
    urlPrefix: '/anomalies',
    contentPath: 'anomalies',
  },
];

describe('resolveArticleType', () => {
  it('returns the correct article type for an anomaly ID', () => {
    const result = resolveArticleType('EID-047', testArticleTypes);
    expect(result?.urlPrefix).toBe('/anomalies');
    expect(result?.idField).toBe('anomalyId');
  });

  it('returns the correct article type for an employee ID', () => {
    const result = resolveArticleType('EID-EMP-001', testArticleTypes);
    expect(result?.urlPrefix).toBe('/employees');
    expect(result?.idField).toBe('employeeId');
  });

  it('returns the correct article type for an organization ID', () => {
    const result = resolveArticleType('EID-ORG-002', testArticleTypes);
    expect(result?.urlPrefix).toBe('/organizations');
    expect(result?.idField).toBe('orgId');
  });

  it('handles case-insensitive matching', () => {
    const result = resolveArticleType('eid-047', testArticleTypes);
    expect(result?.urlPrefix).toBe('/anomalies');
  });

  it('returns null for non-matching IDs', () => {
    const result = resolveArticleType('INVALID-123', testArticleTypes);
    expect(result).toBeNull();
  });

  it('matches more specific patterns before generic ones', () => {
    const resultEmp = resolveArticleType('EID-EMP-001', testArticleTypes);
    expect(resultEmp?.urlPrefix).toBe('/employees');

    const resultOrg = resolveArticleType('EID-ORG-001', testArticleTypes);
    expect(resultOrg?.urlPrefix).toBe('/organizations');
  });
});

describe('buildArticleUrl', () => {
  it('builds correct URL with uppercase ID', () => {
    const url = buildArticleUrl('EID-047', '/anomalies');
    expect(url).toBe('/anomalies/EID-047');
  });

  it('normalizes lowercase IDs to uppercase', () => {
    const url = buildArticleUrl('eid-047', '/anomalies');
    expect(url).toBe('/anomalies/EID-047');
  });

  it('builds correct URL for employee IDs', () => {
    const url = buildArticleUrl('EID-EMP-001', '/employees');
    expect(url).toBe('/employees/EID-EMP-001');
  });
});

describe('findArticleReferences', () => {
  it('finds a single reference in text', () => {
    const text = 'Please refer to EID-047 for more information.';
    const matches = findArticleReferences(text, testArticleTypes);
    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe('EID-047');
    expect(matches[0].urlPrefix).toBe('/anomalies');
  });

  it('finds multiple references of different types', () => {
    const text = 'EID-047 was discovered by EID-EMP-001 at EID-ORG-002.';
    const matches = findArticleReferences(text, testArticleTypes);
    expect(matches).toHaveLength(3);
    expect(matches[0].id).toBe('EID-047');
    expect(matches[1].id).toBe('EID-EMP-001');
    expect(matches[2].id).toBe('EID-ORG-002');
  });

  it('finds lowercase references and normalizes them', () => {
    const text = 'See eid-047 for details.';
    const matches = findArticleReferences(text, testArticleTypes);
    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe('EID-047');
  });

  it('returns empty array when no references found', () => {
    const text = 'This text has no article references.';
    const matches = findArticleReferences(text, testArticleTypes);
    expect(matches).toHaveLength(0);
  });

  it('captures correct start and end positions', () => {
    const text = 'Start EID-047 end';
    const matches = findArticleReferences(text, testArticleTypes);
    expect(matches[0].start).toBe(6);
    expect(matches[0].end).toBe(13);
  });

  it('finds multiple references of the same type', () => {
    const text = 'EID-001 and EID-002 are related.';
    const matches = findArticleReferences(text, testArticleTypes);
    expect(matches).toHaveLength(2);
    expect(matches[0].id).toBe('EID-001');
    expect(matches[1].id).toBe('EID-002');
  });
});

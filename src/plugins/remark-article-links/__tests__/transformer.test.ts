import { describe, it, expect } from 'vitest';
import { transformTextNode } from '../transformer.js';
import type { ArticleTypeConfig, TextNode } from '../types.js';

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

function createTextNode(value: string): TextNode {
  return { type: 'text', value };
}

describe('transformTextNode', () => {
  it('returns original node when no references found', () => {
    const node = createTextNode('No references here.');
    const validIds = new Set(['EID-047']);
    const result = transformTextNode(node, validIds, null, testArticleTypes);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(node);
  });

  it('returns original node when reference is not in valid IDs', () => {
    const node = createTextNode('See EID-999 for details.');
    const validIds = new Set(['EID-047']);
    const result = transformTextNode(node, validIds, null, testArticleTypes);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(node);
  });

  it('transforms a valid reference into a link', () => {
    const node = createTextNode('See EID-047 for details.');
    const validIds = new Set(['EID-047']);
    const result = transformTextNode(node, validIds, null, testArticleTypes);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: 'text', value: 'See ' });
    expect(result[1]).toEqual({
      type: 'link',
      url: '/anomalies/EID-047',
      children: [{ type: 'text', value: 'EID-047' }],
    });
    expect(result[2]).toEqual({ type: 'text', value: ' for details.' });
  });

  it('handles reference at the start of text', () => {
    const node = createTextNode('EID-047 is dangerous.');
    const validIds = new Set(['EID-047']);
    const result = transformTextNode(node, validIds, null, testArticleTypes);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: 'link',
      url: '/anomalies/EID-047',
      children: [{ type: 'text', value: 'EID-047' }],
    });
    expect(result[1]).toEqual({ type: 'text', value: ' is dangerous.' });
  });

  it('handles reference at the end of text', () => {
    const node = createTextNode('Refer to EID-047');
    const validIds = new Set(['EID-047']);
    const result = transformTextNode(node, validIds, null, testArticleTypes);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ type: 'text', value: 'Refer to ' });
    expect(result[1]).toEqual({
      type: 'link',
      url: '/anomalies/EID-047',
      children: [{ type: 'text', value: 'EID-047' }],
    });
  });

  it('excludes self-references', () => {
    const node = createTextNode('EID-047 refers to itself as EID-047.');
    const validIds = new Set(['EID-047']);
    const result = transformTextNode(node, validIds, 'EID-047', testArticleTypes);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(node);
  });

  it('links other references while excluding self-reference', () => {
    const node = createTextNode('EID-047 is related to EID-001.');
    const validIds = new Set(['EID-047', 'EID-001']);
    const result = transformTextNode(node, validIds, 'EID-047', testArticleTypes);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: 'text', value: 'EID-047 is related to ' });
    expect(result[1]).toEqual({
      type: 'link',
      url: '/anomalies/EID-001',
      children: [{ type: 'text', value: 'EID-001' }],
    });
    expect(result[2]).toEqual({ type: 'text', value: '.' });
  });

  it('transforms multiple different reference types', () => {
    const node = createTextNode('EID-047 discovered by EID-EMP-001');
    const validIds = new Set(['EID-047', 'EID-EMP-001']);
    const result = transformTextNode(node, validIds, null, testArticleTypes);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      type: 'link',
      url: '/anomalies/EID-047',
      children: [{ type: 'text', value: 'EID-047' }],
    });
    expect(result[1]).toEqual({ type: 'text', value: ' discovered by ' });
    expect(result[2]).toEqual({
      type: 'link',
      url: '/employees/EID-EMP-001',
      children: [{ type: 'text', value: 'EID-EMP-001' }],
    });
  });

  it('handles case-insensitive matching and normalizes to uppercase', () => {
    const node = createTextNode('See eid-047 for details.');
    const validIds = new Set(['EID-047']);
    const result = transformTextNode(node, validIds, null, testArticleTypes);

    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({
      type: 'link',
      url: '/anomalies/EID-047',
      children: [{ type: 'text', value: 'EID-047' }],
    });
  });

  it('handles case-insensitive self-reference exclusion', () => {
    const node = createTextNode('eid-047 refers to EID-047.');
    const validIds = new Set(['EID-047']);
    const result = transformTextNode(node, validIds, 'eid-047', testArticleTypes);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(node);
  });

  it('only links valid IDs in mixed valid/invalid text', () => {
    const node = createTextNode('EID-047 and EID-999 are different.');
    const validIds = new Set(['EID-047']);
    const result = transformTextNode(node, validIds, null, testArticleTypes);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: 'link',
      url: '/anomalies/EID-047',
      children: [{ type: 'text', value: 'EID-047' }],
    });
    expect(result[1]).toEqual({ type: 'text', value: ' and EID-999 are different.' });
  });
});

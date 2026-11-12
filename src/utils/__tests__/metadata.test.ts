import { describe, expect, it } from 'vitest';
import { metadataError, parseMetadata, serializeMetadata } from '../metadata';
import { matchesContent, metadataLabel } from '../content-data';
import { metadataField } from '../../components/react/metadata-field';

describe('metadata field', () => {
  const field = metadataField();

  it('round-trips an arbitrary text map through the CMS without flattening reserved keys', () => {
    const metadata = {
      id: 'Secondary ID',
      name: 'Another name',
      'custom.key': 'Arbitrary value',
      constructor: 'Text, not a prototype property',
      notes: 'First line\nSecond line',
      empty: '',
    };
    const rows = field.parse(metadata);
    expect(field.serialize(field.validate(rows)).value).toEqual(metadata);
    expect(field.reader.parse(metadata)).toEqual(metadata);
  });

  it('supports records without metadata and removing all rows', () => {
    expect(field.defaultValue()).toEqual([]);
    expect(field.parse(undefined)).toEqual([]);
    expect(field.serialize([]).value).toEqual({});
  });

  it.each([null, [], 42, true, 'text', new Date(), { count: 42 }, { ' ': 'blank' }])(
    'rejects invalid stored metadata: %j',
    value => expect(() => parseMetadata(value)).toThrow(),
  );

  it('does not silently overwrite duplicate or blank keys', () => {
    const duplicate = [{ key: 'status', value: 'A' }, { key: 'status', value: 'B' }];
    expect(metadataError(duplicate)).toContain('Duplicate');
    expect(() => field.validate(duplicate)).toThrow('Duplicate');
    expect(() => serializeMetadata([{ key: ' ', value: 'A' }])).toThrow('blank');
  });

  it('can serialize unfinished input for CMS change detection without allowing a save', () => {
    const unfinished = [{ key: '', value: '' }];
    expect(() => field.serialize(unfinished)).not.toThrow();
    expect(() => field.validate(unfinished)).toThrow('blank');
  });
});

describe('metadata display and search', () => {
  const item = { id: 'EID-001', name: 'Door', metadata: { clearanceLevel: 'Level 5', location: 'Arkham' } };

  it('labels existing camelCase keys and user-defined keys', () => {
    expect(metadataLabel('clearanceLevel')).toBe('Clearance Level');
    expect(metadataLabel('custom-key_name')).toBe('Custom key name');
  });

  it('searches IDs, names, arbitrary metadata keys, and values', () => {
    for (const query of ['eid-001', 'DOOR', 'clearance', 'level 5', ' ARKHAM ']) {
      expect(matchesContent(item, query)).toBe(true);
    }
    expect(matchesContent(item, 'missing')).toBe(false);
    expect(matchesContent({ id: 'new', name: 'Empty', metadata: {} }, 'empty')).toBe(true);
  });
});

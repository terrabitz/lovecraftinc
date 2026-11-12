/** @jsxImportSource react */
import { useId } from 'react';
import type { BasicFormField, FormFieldInputProps } from '@terrabitz/keystatic-core';
import { metadataError, parseMetadata, serializeMetadata, type MetadataRow } from '../../utils/metadata';
import styles from './metadata-field.module.css';

export function metadataField(): BasicFormField<MetadataRow[], MetadataRow[], Record<string, string>> {
  return {
    kind: 'form',
    label: 'Metadata',
    Input: MetadataInput,
    defaultValue: () => [],
    parse: parseMetadata,
    // Keystatic also serializes unfinished input for change detection, before validation.
    serialize: rows => ({ value: Object.fromEntries(rows.map(row => [row.key, row.value])) }),
    validate: rows => {
      serializeMetadata(rows);
      return rows;
    },
    reader: { parse: value => serializeMetadata(parseMetadata(value)) },
  };
}

function MetadataInput({ value, onChange, autoFocus, forceValidation }: FormFieldInputProps<MetadataRow[]>) {
  const id = useId();
  const error = metadataError(value);

  function updateRow(index: number, patch: Partial<MetadataRow>) {
    onChange(value.map((row, i) => i === index ? { ...row, ...patch } : row));
  }

  return (
    <fieldset className={styles.field} aria-describedby={error ? `${id}-error` : undefined}>
      <legend>Metadata</legend>
      <p>Add any text key-value pairs for this record.</p>
      {value.map((row, index) => (
        <div className={styles.row} key={index}>
          <label>
            Key
            <input
              value={row.key}
              autoFocus={autoFocus && index === 0}
              onChange={event => updateRow(index, { key: event.target.value })}
              aria-invalid={forceValidation && (!row.key.trim() || value.some((other, i) => i !== index && other.key === row.key))}
            />
          </label>
          <label>
            Value
            <textarea value={row.value} onChange={event => updateRow(index, { value: event.target.value })} />
          </label>
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label={`Remove metadata ${row.key || index + 1}`}>
            Remove
          </button>
        </div>
      ))}
      {error && <p id={`${id}-error`} role="alert">{error}</p>}
      <button type="button" onClick={() => onChange([...value, { key: '', value: '' }])}>Add metadata</button>
    </fieldset>
  );
}

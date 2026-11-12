import { config, fields, collection } from '@terrabitz/keystatic-core';
import { wrapper, inline } from '@terrabitz/keystatic-core/content-components';
import { mapContentTypes } from './src/content-types';
import { metadataField } from './src/components/react/metadata-field';

const storage = import.meta.env.PUBLIC_KEYSTATIC_MODE === 'github' ? {
  kind: 'github' as const,
  repo: {
    owner: import.meta.env.PUBLIC_GITHUB_OWNER || '',
    name: import.meta.env.PUBLIC_GITHUB_REPO || '',
  },
  lfs: true,
} : {
  kind: 'local' as const,
};

export default config({
  storage,
  collections: mapContentTypes(type => collection({
    label: type.label,
    slugField: 'id',
    path: `src/content/${type.slug}/*`,
    format: { contentField: 'content' },
    columns: ['name'],
    schema: {
      id: fields.slug({
        name: {
          label: 'ID',
          validation: {
            isRequired: true,
            pattern: {
              regex: new RegExp(`^(?:${type.idPattern.source})$`),
              message: type.idHint,
            },
          },
        },
        slug: {
          generate: text => text.toUpperCase().replace(/\s+/g, '-'),
        },
      }),
      name: fields.text({ label: 'Name', validation: { isRequired: true } }),
      metadata: metadataField(),
      content: contentField(type.slug),
    },
  })),
});

function contentField(collectionName: string) {
  return fields.markdoc({
    label: 'Content',
    extension: 'mdoc',
    components: {
      callout: wrapper({
        label: 'Callout',
        schema: {
          type: fields.select({
            label: 'Type',
            options: [
              { label: 'Info', value: 'info' },
              { label: 'Warning', value: 'warning' },
              { label: 'Error', value: 'error' },
            ],
            defaultValue: 'info',
          }),
          title: fields.text({ label: 'Title', validation: { isRequired: true } }),
        },
      }),
      'dice-roller': inline({
        label: 'Dice Roller',
        schema: {
          sides: fields.integer({ label: 'Sides', defaultValue: 20 }),
        },
      }),
    },
    options: {
      image: {
        directory: `src/assets/content/${collectionName}`,
        publicPath: `@assets/content/${collectionName}/`,
        transformFilename: (originalFilename: string) => {
          const sanitized = originalFilename
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, '-')
            .replace(/-+/g, '-');
          return `${Date.now()}-${sanitized}`;
        },
      },
    },
  });
}

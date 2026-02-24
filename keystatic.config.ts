import { config, fields, collection } from '@terrabitz/keystatic-core';
import { wrapper, inline } from '@terrabitz/keystatic-core/content-components';
import { createElement } from 'react';
import DiceRoller from './src/components/react/DiceRoller';

function contentField(collectionName: string) {
  return fields.markdoc({
    label: 'Content',
    extension: 'mdoc',
    components: {
      callout: wrapper({
        label: 'Callout',
        schema: {
          type: fields.select({
            label: "Type", 
            options: [
              {label: "Info", value: "info"}, 
              {label: "Warning", value: "warning"}, 
              {label: "Error", value: "error"}
            ],
            defaultValue: "info"
          }),
          title: fields.text({ label: 'Title' }),
        },
      }),
      "dice-roller": inline({
        label: 'Dice Roller',
        schema: {
          initialDie: fields.text({ label: 'Die Type', defaultValue: 'd20' }),
        },
        ContentView: (props) =>
          createElement(DiceRoller, { initialDie: props.value.initialDie }),
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

const storage = import.meta.env.PUBLIC_KEYSTATIC_MODE === 'github' ? {
    kind: 'github' as const,
    repo: {
      owner: import.meta.env.PUBLIC_GITHUB_OWNER || '',
      name: import.meta.env.PUBLIC_GITHUB_REPO || '',
    },
    lfs: true,
  } : {
    kind: 'local' as const
  }

export default config({
  storage: storage,

  collections: {
    anomalies: collection({
      label: 'Anomalies',
      slugField: 'id',
      path: 'src/content/anomalies/*',
      format: { contentField: 'content' },
      columns: ['name', 'classification', 'status'],
      schema: {
        id: fields.slug({
          name: {
            label: 'ID',
            validation: {
              isRequired: true,
              pattern: {
                regex: /^EID-\d+$/,
                message: 'ID must start with "EID-" followed by numbers (e.g. EID-123)',
              },
            },
          },
          slug: {
            generate: (text) => text.toUpperCase().replace(/\s+/g, '-'),
          },
          
        }),
        name: fields.text({ label: 'Name', validation: { isRequired: true } }),
        classification: fields.text({ label: 'Classification', validation: { isRequired: true } }),
        status: fields.text({ label: 'Status', validation: { isRequired: true } }),
        discoveryDate: fields.date({ label: 'Discovery Date', validation: { isRequired: true } }),
        location: fields.text({ label: 'Location', validation: { isRequired: true } }),
        content: contentField('anomalies'),
      },
    }),
    employees: collection({
      label: 'Employees',
      slugField: 'id',
      path: 'src/content/employees/*',
      format: { contentField: 'content' },
      columns: ['name', 'position', 'department'],
      schema: {
        id: fields.slug({
          name: {
            label: 'ID',
            validation: {
              isRequired: true,
              pattern: {
                regex: /^EID-EMP-\d+$/,
                message: 'ID must start with "EID-EMP-" followed by numbers',
              },
            },
          },
          slug: {
            generate: (text) => text.toUpperCase().replace(/\s+/g, '-'),
          },
        }),
        name: fields.text({ label: 'Name', validation: { isRequired: true } }),
        position: fields.text({ label: 'Position', validation: { isRequired: true } }),
        department: fields.text({ label: 'Department', validation: { isRequired: true } }),
        clearanceLevel: fields.text({ label: 'Clearance Level', validation: { isRequired: true } }),
        content: contentField('employees'),
      },
    }),
    organizations: collection({
      label: 'Organizations',
      slugField: 'id',
      path: 'src/content/organizations/*',
      format: { contentField: 'content' },
      columns: ['name', 'type', 'relationship'],
      schema: {
        id: fields.slug({
          name: {
            label: 'ID',
            validation: {
              isRequired: true,
              pattern: {
                regex: /^EID-ORG-\d+$/,
                message: 'ID must start with "EID-ORG-" followed by numbers',
              },
            },
          },
          slug: {
            generate: (text) => text.toUpperCase().replace(/\s+/g, '-'),
          },
        }),
        name: fields.text({ label: 'Name', validation: { isRequired: true } }),
        type: fields.text({ label: 'Type', validation: { isRequired: true } }),
        relationship: fields.text({ label: 'Relationship', validation: { isRequired: true } }),
        established: fields.text({ label: 'Established', validation: { isRequired: true } }),
        location: fields.text({ label: 'Location', validation: { isRequired: true } }),
        content: contentField('organizations'),
      },
    }),
  },
});

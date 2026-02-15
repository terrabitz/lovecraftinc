import { config, fields, collection } from '@keystatic/core';

const storage = import.meta.env.PUBLIC_KEYSTATIC_MODE === 'github' ? {
    kind: 'github' as const,
    repo: {
      owner: import.meta.env.PUBLIC_GITHUB_OWNER || '',
      name: import.meta.env.PUBLIC_GITHUB_REPO || '',
    }
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
        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
          options: {
            image: {
              directory: 'src/assets/anomalies',
              publicPath: '@assets/anomalies/',
              transformFilename(originalFilename): string {
                return `${Date.now()}-${originalFilename}`
              },
            },
          },
        }),
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
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
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
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
      },
    }),
  },
});

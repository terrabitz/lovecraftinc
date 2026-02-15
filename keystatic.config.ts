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
      columns: ['id', 'name', 'classification', 'status'],
      schema: {
        id: fields.slug({
          name: { label: 'ID' },
          slug: {
            generate: (text) => text.toUpperCase().replace(/\s+/g, '-'),
          },
        }),
        name: fields.text({ label: 'Name' }),
        classification: fields.text({ label: 'Classification' }),
        status: fields.text({ label: 'Status' }),
        discoveryDate: fields.date({ label: 'Discovery Date' }),
        location: fields.text({ label: 'Location' }),
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
      columns: ['id', 'name', 'position', 'department'],
      schema: {
        id: fields.slug({
          name: { label: 'ID' },
          slug: {
            generate: (text) => text.toUpperCase().replace(/\s+/g, '-'),
          },
        }),
        name: fields.text({ label: 'Name' }),
        position: fields.text({ label: 'Position' }),
        department: fields.text({ label: 'Department' }),
        clearanceLevel: fields.text({ label: 'Clearance Level' }),
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
      },
    }),
    organizations: collection({
      label: 'Organizations',
      slugField: 'id',
      path: 'src/content/organizations/*',
      format: { contentField: 'content' },
      columns: ['id', 'name', 'type', 'relationship'],
      schema: {
        id: fields.slug({
          name: { label: 'ID' },
          slug: {
            generate: (text) => text.toUpperCase().replace(/\s+/g, '-'),
          },
        }),
        name: fields.text({ label: 'Name' }),
        type: fields.text({ label: 'Type' }),
        relationship: fields.text({ label: 'Relationship' }),
        established: fields.text({ label: 'Established' }),
        location: fields.text({ label: 'Location' }),
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
      },
    }),
  },
});

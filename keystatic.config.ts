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
      schema: {
        id: fields.slug({ name: { label: 'ID' } }),
        name: fields.text({
          label: 'Name',
        }),
        classification: fields.text({
          label: 'Classification',
        }),
        status: fields.text({
          label: 'Status',
        }),
        discoveryDate: fields.date({
          label: 'Discovery Date',
        }),
        location: fields.text({
          label: 'Location',
        }),
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
  },
});
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },

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
              publicPath: '../../assets/anomalies/',
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
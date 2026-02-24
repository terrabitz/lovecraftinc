import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    callout: {
      render: component('./src/components/Callout.astro'),
      attributes: {
        type: { type: String, default: 'info' },
        title: { type: String, required: true },
      },
    },
    "dice-roller": {
      render: component('./src/components/ClientDiceRoller.astro'),
      attributes: {
        initialDie: { type: String, default: 'd20' }
      }
    }
  },
});
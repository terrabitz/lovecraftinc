import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://lovecraftinc.example.com',
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});

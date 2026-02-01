import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://eidolon.hackandsla.sh',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file'
  },

  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
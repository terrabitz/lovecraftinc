import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import remarkToc from 'remark-toc';

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
    remarkPlugins: [ [remarkToc, { maxDepth: 3 } ] ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
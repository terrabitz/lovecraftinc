import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

import tailwindcss from '@tailwindcss/vite';
import remarkToc from 'remark-toc';
import { remarkArticleLinks } from './src/plugins/remark-article-links/index.ts';
import rehypeTooltip from './src/plugins/rehype-tooltip/index.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://eidolon.hackandsla.sh',
  output: 'static',
  trailingSlash: 'never',
  integrations: [preact()],
  build: {
    format: 'file'
  },

  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
    remarkPlugins: [
      [remarkToc, { maxDepth: 3 } ],
      [ remarkArticleLinks,
        {
          contentDir: './src/content',
          articleTypes: [
            {
              pattern: /EID-EMP-\d+/,
              urlPrefix: '/employees',
              contentPath: 'employees',
            },
            {
              pattern: /EID-ORG-\d+/,
              urlPrefix: '/organizations',
              contentPath: 'organizations',
            },
            {
              pattern: /EID-\d+/,
              urlPrefix: '/anomalies',
              contentPath: 'anomalies',
            },
          ],
        },
      ]
    ],
    rehypePlugins: [rehypeTooltip],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
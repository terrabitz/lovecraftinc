import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import remarkToc from 'remark-toc';
import { remarkArticleLinks } from './src/plugins/remark-article-links/index.ts';

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
    remarkPlugins: [
      [remarkToc, { maxDepth: 3 } ],
      [ remarkArticleLinks,
        {
          contentDir: './src/content',
          articleTypes: [
            {
              pattern: /EID-EMP-\d{3}/,
              idField: 'employeeId',
              urlPrefix: '/employees',
              contentPath: 'employees',
            },
            {
              pattern: /EID-ORG-\d{3}/,
              idField: 'orgId',
              urlPrefix: '/organizations',
              contentPath: 'organizations',
            },
            {
              pattern: /EID-\d{3}/,
              idField: 'anomalyId',
              urlPrefix: '/anomalies',
              contentPath: 'anomalies',
            },
          ],
        },
      ]
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
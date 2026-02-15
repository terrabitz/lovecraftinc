import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

import tailwindcss from '@tailwindcss/vite';
import remarkToc from 'remark-toc';
import { remarkArticleLinks } from './src/plugins/remark-article-links/index.ts';
import rehypeTooltip from './src/plugins/rehype-tooltip/index.ts';
import cleanupUnoptimizedImages from './src/integrations/cleanup-unoptimized-images.ts';
import cloudflare from '@astrojs/cloudflare';
import arraybuffer from "vite-plugin-arraybuffer";
import { imagetools } from 'vite-imagetools';
import { loadEnv } from "vite";
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro'

function getModeFromArgs() {
  const modeFlagIndex = process.argv.indexOf('--mode');
  if (modeFlagIndex !== -1 && process.argv[modeFlagIndex + 1]) {
    return process.argv[modeFlagIndex + 1];
  }

  return process.env.NODE_ENV || 'development';
}

const mode = getModeFromArgs();
const { DEFAULT_BRANCH, WORKER_NAME, WORKERS_DEV_ACCOUNT_DOMAIN, WORKERS_CI_BRANCH, PUBLIC_SITE_URL } = loadEnv(mode, process.cwd(), "");

function toBranchSlug(branchName = '') {
  return branchName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getSiteUrl(WORKERS_CI_BRANCH, DEFAULT_BRANCH, WORKER_NAME, WORKERS_DEV_ACCOUNT_DOMAIN, PUBLIC_SITE_URL) {
  // When running in Cloudflare workers, we should use the branch-specific 
  // URLs instead. This helps ensure that each branch gets its own unique
  // links to the site in places where we need to use absolute URLs, like 
  // Open Graph image links.
  if (WORKERS_CI_BRANCH && WORKERS_CI_BRANCH !== DEFAULT_BRANCH) {
    const branchSlug = toBranchSlug(WORKERS_CI_BRANCH);
    if (branchSlug) {
      return `https://${branchSlug}-${WORKER_NAME}.${WORKERS_DEV_ACCOUNT_DOMAIN}`;
    }
  }

  if (PUBLIC_SITE_URL) {
    return PUBLIC_SITE_URL;
  };
  
  throw new Error("Couldn't find site config. Set PUBLIC_SITE_URL or use a correct env file.")
}

const site = getSiteUrl(WORKERS_CI_BRANCH, DEFAULT_BRANCH, WORKER_NAME, WORKERS_DEV_ACCOUNT_DOMAIN, PUBLIC_SITE_URL)

console.log('Environment variables:', {
  MODE: mode,
  DEFAULT_BRANCH,
  WORKER_NAME,
  WORKERS_DEV_ACCOUNT_DOMAIN,
  WORKERS_CI_BRANCH,
  PUBLIC_SITE_URL,
  ASTRO_SITE: site,
});

// https://astro.build/config
export default defineConfig({
  site: site,
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    preact({
      include: ["**/preact/*.tsx"],
    }), 
    cleanupUnoptimizedImages(), 
    react({
      include: ["**/react/**.tsx"],
    }), 
    markdoc(), 
    keystatic(),
  ],
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
    plugins: [tailwindcss(), arraybuffer(), imagetools()],
  },
  adapter: cloudflare({
    imageService: 'compile',
  }),
});
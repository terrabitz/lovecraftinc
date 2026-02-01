import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tinaDirective from './astro-tina-directive/register.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://lovecraftinc.example.com',

  integrations: [react(), tinaDirective()],

  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});
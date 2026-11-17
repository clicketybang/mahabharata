// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// Static site with React islands (roadmap §3).
export default defineConfig({
  output: 'static',
  integrations: [react(), mdx()],
});

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import alpinejs from "@astrojs/alpinejs";
import icon from "astro-icon";

import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
  site: 'https://artistrooms.org',
  integrations: [mdx(), sitemap(), tailwind(), alpinejs({entrypoint:'/src/alpine-entry.ts'}), icon(), pagefind(),]
});
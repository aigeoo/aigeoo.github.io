import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Give every prose block its own resolved direction. With dir="auto" the
// browser picks each block's direction from its first strong character, so in
// an Arabic (RTL) post an all-Latin line (e.g. a path or command) and an
// image-only paragraph render LTR/left-aligned, while Arabic blocks stay RTL.
// Code blocks are always LTR.
function rehypeAutoDir() {
  const autoTags = new Set([
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'li', 'blockquote', 'dd', 'dt', 'figcaption', 'td', 'th',
  ]);
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element') {
        node.properties ??= {};
        if (autoTags.has(node.tagName) && node.properties.dir == null) {
          node.properties.dir = 'auto';
        } else if (node.tagName === 'pre' && node.properties.dir == null) {
          node.properties.dir = 'ltr';
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://aigeoo.github.io',
  // English at the root ('/'), Arabic under '/ar/'. No prefix on the default
  // locale keeps the existing/primary URLs clean.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    routing: { prefixDefaultLocale: false },
  },
  compressHTML: true,
  markdown: {
    // Emit --astro-code-* variables instead of fixed hex colors, so code
    // blocks follow the active palette (defined in public/css/style.css).
    shikiConfig: { theme: 'css-variables' },
    rehypePlugins: [rehypeAutoDir],
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ar: 'ar' },
      },
    }),
  ],
});

import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    // Locale the post is written in; drives which locale's blog index and
    // routes it appears under. Defaults to the site's default language.
    lang: z.enum(['en', 'ar']).default('en'),
    // Optional free-form tags, preserved from the original post.
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };

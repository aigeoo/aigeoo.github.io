import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { ui, localizePath } from '../../i18n/ui';

const lang = 'ar' as const;

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog'))
    .filter((post) => !post.data.draft && post.data.lang === lang)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: ui[lang]['site.name'],
    description: ui[lang]['site.description'],
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: localizePath(`/blog/${post.id.replace(/\.(md|mdx)$/i, '')}/`, lang),
    })),
    customData: '<language>ar</language>',
  });
}

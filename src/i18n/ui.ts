// Central place for the two locales, their UI strings, and the small helpers
// the pages and Layout use to build locale-aware links and text.

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLang: Locale = 'en';

// Human labels for the language switcher.
export const languages: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};

// Text direction per locale — drives <html dir> and the RTL stylesheet layer.
export const dir: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

export const ui = {
  en: {
    'site.name': "Yousuf's Blog",
    'site.description': 'almost everthing',
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.search': 'Search (Ctrl+K)',
    'nav.langToggle': 'العربية',
    'nav.langToggleAria': 'Switch to Arabic',
    'blog.head': 'Blog',
    'blog.title': 'Blog',
    'blog.latest': 'latest',
    'blog.all': 'All posts',
    'blog.empty': 'No posts yet, check back soon.',
    'search.placeholder': 'Search query',
    'search.esc': 'esc',
    'search.empty': 'Type to search',
    'search.noMatches': 'No matches for',
    'search.notBuilt': 'Search index not found: run npm run build to generate it.',
    'footer.name': "Yousuf's Blog",
    'notFound.title': '404',
    'notFound.body': "That page doesn't exist.",
    'notFound.home': 'Go home',
  },
  ar: {
    'site.name': 'مدونة يوسف',
    'site.description': 'almost everthing',
    'nav.home': 'الرئيسية',
    'nav.blog': 'المدونة',
    'nav.about': 'عنّي',
    'nav.search': 'بحث (Ctrl+K)',
    'nav.langToggle': 'EN',
    'nav.langToggleAria': 'التبديل إلى الإنجليزية',
    'blog.head': 'المدونة',
    'blog.title': 'المدونة',
    'blog.latest': 'الأحدث',
    'blog.all': 'كل المقالات',
    'blog.empty': 'لا توجد مقالات بعد، عُد قريبًا.',
    'search.placeholder': 'نص البحث',
    'search.esc': 'esc',
    'search.empty': 'اكتب للبحث',
    'search.noMatches': 'لا نتائج لـ',
    'search.notBuilt': 'لم يُعثر على فهرس البحث: شغّل npm run build لإنشائه.',
    'footer.name': 'مدونة يوسف',
    'notFound.title': '404',
    'notFound.body': 'هذه الصفحة غير موجودة.',
    'notFound.home': 'العودة إلى الرئيسية',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];

// Derive the active locale from the URL's first path segment.
export function getLangFromUrl(url: URL): Locale {
  const seg = url.pathname.split('/')[1];
  return seg === 'ar' ? 'ar' : defaultLang;
}

export function useTranslations(lang: Locale) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

// Prefix a root-absolute path ("/blog/") with the locale ("/ar/blog/").
// The default locale lives at the root and gets no prefix.
export function localizePath(path: string, lang: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
}

// Given the current pathname, return the same page in the other locale,
// used by the header language toggle.
export function alternatePath(pathname: string, current: Locale): string {
  if (current === 'ar') {
    const stripped = pathname.replace(/^\/ar(?=\/|$)/, '');
    return stripped === '' ? '/' : stripped;
  }
  return pathname === '/' ? '/ar/' : `/ar${pathname}`;
}

// Intl locale tag for date formatting (Arabic gets Arabic month names/numerals).
export function dateLocale(lang: Locale): string {
  return lang === 'ar' ? 'ar' : 'en';
}

// Direction of a piece of text from its first strong-directional character,
// so a post's title (and the card around it) reads LTR when English and RTL
// when Arabic, regardless of which locale's blog index lists it.
const RTL_CHAR = /[֐-׿؀-ۿݐ-ݿࢠ-ࣿיִ-﷿ﹰ-﻿]/;
const LTR_CHAR = /[A-Za-zÀ-ʯͰ-ӿ]/;
export function detectDir(text: string): 'ltr' | 'rtl' {
  for (const ch of text) {
    if (RTL_CHAR.test(ch)) return 'rtl';
    if (LTR_CHAR.test(ch)) return 'ltr';
  }
  return 'ltr';
}

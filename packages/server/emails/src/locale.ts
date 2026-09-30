import type { EmailLocale } from './types.ts';
import { DEFAULT_EMAIL_LOCALE, EMAIL_LOCALES } from './types.ts';

function primaryTag(tag: string): string {
  return tag.split('-')[0] ?? tag;
}

/**
 * Picks the best supported locale from an `Accept-Language` header value:
 * highest `q` first, and for each tag an exact match before a language-only
 * match (`en-GB` → `en-US`). Falls back to `DEFAULT_EMAIL_LOCALE`.
 */
export function matchEmailLocale(acceptLanguage: string | null | undefined): EmailLocale {
  if (!acceptLanguage) {
    return DEFAULT_EMAIL_LOCALE;
  }
  const languages = acceptLanguage.toLowerCase().split(',').map((entry, index) => {
    const [tag = '', ...attributes] = entry.trim().split(';');
    const quality = attributes.map((attribute) => /^\s*q\s*=\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*$/.exec(attribute)?.[1]).find(Boolean);
    return { tag: tag.trim(), quality: quality === undefined ? 1 : Number(quality), index };
  }).filter(({ quality }) => quality > 0).sort((a, b) => b.quality - a.quality || a.index - b.index);
  for (const { tag: language } of languages) {
    const match = EMAIL_LOCALES.find((locale) => locale.toLowerCase() === language)
      ?? EMAIL_LOCALES.find((locale) => primaryTag(locale.toLowerCase()) === primaryTag(language));
    if (match) {
      return match;
    }
  }
  return DEFAULT_EMAIL_LOCALE;
}

import { parseVariantGroup } from 'unocss';

export function parseThemeClasses<T>(value: T): T {
  if (typeof value === 'string') {
    return parseVariantGroup(value).expanded as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => parseThemeClasses(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        parseThemeClasses(entry),
      ]),
    ) as T;
  }

  return value;
}

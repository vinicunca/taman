import type { ArrayFormat } from './types';

/**
 * qs-style query string built on `URLSearchParams`: nested objects become
 * `a[b]=1`, arrays follow `arrayFormat`, arrays containing objects always
 * use indices, `Date` → ISO string, `null` → `key=`, `undefined` → omitted.
 */
export function serializeQuery(query: Record<string, unknown>, arrayFormat: ArrayFormat = 'repeat'): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    appendValue(params, key, value, arrayFormat);
  }
  return params.toString();
}

function appendValue(params: URLSearchParams, key: string, value: unknown, arrayFormat: ArrayFormat): void {
  if (value === undefined) {
    return;
  }
  if (value === null) {
    params.append(key, '');
    return;
  }
  if (value instanceof Date) {
    params.append(key, value.toISOString());
    return;
  }
  if (Array.isArray(value)) {
    appendArray(params, key, value, arrayFormat);
    return;
  }
  if (typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value)) {
      appendValue(params, `${key}[${childKey}]`, child, arrayFormat);
    }
    return;
  }
  params.append(key, String(value));
}

function isPlainObjectItem(item: unknown): boolean {
  return typeof item === 'object' && item !== null && !(item instanceof Date);
}

function scalar(item: unknown): string {
  if (item === null) {
    return '';
  }
  return item instanceof Date ? item.toISOString() : String(item);
}

function appendArray(params: URLSearchParams, key: string, items: Array<unknown>, arrayFormat: ArrayFormat): void {
  const present = items.filter((item) => item !== undefined);
  if (present.length === 0) {
    return;
  }

  if (arrayFormat === 'indices' || present.some(isPlainObjectItem)) {
    items.forEach((item, index) => {
      appendValue(params, `${key}[${index}]`, item, arrayFormat);
    });
    return;
  }

  if (arrayFormat === 'comma') {
    params.append(key, present.map(scalar).join(','));
    return;
  }

  const itemKey = arrayFormat === 'brackets' ? `${key}[]` : key;
  for (const item of present) {
    params.append(itemKey, scalar(item));
  }
}

/** Appends an already-serialized query string to a URL. */
export function appendQueryString(url: string, queryString: string): string {
  if (!queryString) {
    return url;
  }
  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
}

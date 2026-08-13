import type { Recordable } from '@taman/types';

/**
 * In-memory cache so the remote API is not called again until the page reloads.
 */
export const ICONS_MAP: Recordable<string[]> = {};

interface IconifyResponse {
  prefix: string;
  total: number;
  title: string;
  uncategorized?: string[];
  categories?: Recordable<string[]>;
  aliases?: Recordable<string>;
}

const PENDING_REQUESTS: Recordable<Promise<string[]>> = {};

/**
 * Fetch icon set data from the Iconify API.
 * Concurrent requests for the same prefix share one in-flight request.
 * Results are cached for the lifetime of the page.
 * @param prefix Icon collection prefix
 * @returns All icon names in the collection
 */
export async function fetchIconsData(prefix: string): Promise<string[]> {
  if (Reflect.has(ICONS_MAP, prefix) && ICONS_MAP[prefix]) {
    return ICONS_MAP[prefix];
  }
  if (Reflect.has(PENDING_REQUESTS, prefix) && PENDING_REQUESTS[prefix]) {
    return PENDING_REQUESTS[prefix];
  }
  PENDING_REQUESTS[prefix] = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000 * 10);
      const response: IconifyResponse = await fetch(
        `https://api.iconify.design/collection?prefix=${prefix}`,
        { signal: controller.signal },
      ).then((res) => res.json());
      clearTimeout(timeoutId);
      const list = response.uncategorized || [];
      if (response.categories) {
        for (const category in response.categories) {
          list.push(...(response.categories[category] || []));
        }
      }
      ICONS_MAP[prefix] = list.map((v) => `${prefix}:${v}`);
    } catch (error) {
      console.error(`Failed to fetch icons for prefix ${prefix}:`, error);
      return [] as string[];
    }
    return ICONS_MAP[prefix];
  })();
  return PENDING_REQUESTS[prefix];
}

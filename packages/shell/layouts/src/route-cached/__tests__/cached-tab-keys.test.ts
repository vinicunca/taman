import { describe, expect, it } from 'vitest';

import { getCachedTabKeys } from '../cached-tab-keys';

describe('getCachedTabKeys', () => {
  it('uses the stored tab key so cleanup keeps the registered cached route', () => {
    // addCachedRoute uses the merged route.meta to calculate "/detail",
    // while the tab's own meta only has leaf records, re-deriving will get "/detail?id=7"
    const tabs = [
      {
        fullPath: '/detail?id=7',
        key: '/detail',
        meta: { domCached: true },
        name: 'Detail',
        path: '/detail',
        query: { id: '7' },
      },
    ] as any;

    expect(getCachedTabKeys(tabs)).toEqual(['/detail']);
  });

  it('skips tabs that are not dom cached', () => {
    const tabs = [
      {
        fullPath: '/home',
        key: '/home',
        meta: {},
        name: 'Home',
        path: '/home',
      },
      {
        fullPath: '/detail',
        key: '/detail',
        meta: { domCached: true },
        name: 'Detail',
        path: '/detail',
      },
    ] as any;

    expect(getCachedTabKeys(tabs)).toEqual(['/detail']);
  });
});

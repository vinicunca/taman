import type { TamanTabDefinition } from '@vinicunca/taman-core/typings';

import { getTabKey } from '@taman/stores';

/**
 * The route key must be preserved for caching purposes. For existing tabs, the tab's own key takes precedence;
 * this prevents accidental deletion of the cache—which could occur if the key were re-derived from `meta` and subsequently differed from the one used in `addCachedRoute`.
 */
export function getCachedTabKeys(tabs: Array<TamanTabDefinition>): Array<string> {
  return tabs
    .filter((item) => item.meta.domCached)
    .map((item) => item.key ?? getTabKey(item));
}

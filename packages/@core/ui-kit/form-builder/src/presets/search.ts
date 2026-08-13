import type { FormApi } from '../form-api';
import type { TamanFormOptions } from '../types';
import { isEqual } from '@taman-core/shared/utils';

/**
 * `preset: 'search'` merges search-bar defaults under whatever the caller
 * already set: a responsive 1/2/3 column grid, default action buttons, and
 * a collapsed-by-default single row (see `expandable.ts` for the row math
 * that decides where the collapse boundary falls).
 */
export function applySearchPreset(options: TamanFormOptions): TamanFormOptions {
  if (options.preset !== 'search') {
    return options;
  }

  return {
    collapsed: true,
    collapsedRows: 1,
    showDefaultActions: true,
    ...options,
    layout: {
      cols: { base: 1, lg: 3, md: 2 },
      ...options.layout,
    },
  };
}

export interface SubmitOnChangeNotifier {
  (): void;
  /** Drop any pending debounce (call on unmount so no submit fires after it). */
  cancel: () => void;
}

/** Debounced change-notifier: submits when values differ from the last submission. */
export function createSubmitOnChange(
  api: FormApi,
  debounceMs = 300,
): SubmitOnChangeNotifier {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const notify = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const current = api.getValues();
      if (!isEqual(current, api.getLatestSubmissionValues())) {
        void api.submit();
      }
    }, debounceMs);
  };
  notify.cancel = () => clearTimeout(timer);
  return notify;
}

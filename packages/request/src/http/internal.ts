import type { HttpRequestOptions } from './types';

/** Request-context `meta` key set by presets that re-issue a request. */
export const RETRIED = Symbol.for('vinicunca.request.retried');

/** Options accepted internally: the public options plus the retry marker. */
export type InternalRequestOptions = HttpRequestOptions & { [RETRIED]?: boolean };

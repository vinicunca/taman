import type { ResponseInterceptor } from '../types';
import { getServerMessage, HttpError } from '../errors';

export interface EnvelopeInterceptorOptions {
  /** Field holding the result code. Default `'code'`. */
  codeField?: string;
  /** Field holding the payload, or a function that extracts it. Default `'data'`. */
  dataField?: string | ((body: Record<string, unknown>) => unknown);
  /** Success code, or a predicate. Default `0`. */
  successCode?: string | number | boolean | ((code: unknown) => boolean);
}

/**
 * Unwraps `{ code, data, message }` envelopes for requests made with
 * `responseReturn: 'data'`. `raw` and `body` requests pass through untouched.
 */
export function envelopeInterceptor(options: EnvelopeInterceptorOptions = {}): ResponseInterceptor {
  const { codeField = 'code', dataField = 'data', successCode = 0 } = options;

  return {
    fulfilled(response) {
      if (response.request.options.responseReturn !== 'data') {
        return response;
      }

      // 204 / empty body: nothing to unwrap.
      if (response.data === undefined || response.data === null || response.data === '') {
        response.data = undefined;
        return response;
      }

      const body = response.data as Record<string, unknown>;
      const code = body[codeField];
      const ok = typeof successCode === 'function' ? successCode(code) : code === successCode;

      if (!ok) {
        throw new HttpError({
          kind: 'envelope',
          message: getServerMessage(body) ?? `Request failed with code ${String(code)}`,
          request: { url: response.request.url, method: response.request.options.method },
          context: response.request,
          status: response.status,
          code,
          data: body,
          response: response.response,
        });
      }

      response.data = typeof dataField === 'function' ? dataField(body) : body[dataField];
      return response;
    },
  };
}

import type { FetchResponse } from 'ofetch';

import type {
  ApiEnvelope,
  CreateFetchClientOptions,
  FetchClient,
  RequestOptions,
} from './types';

import { ofetch } from 'ofetch';

import { ApiError } from './errors';

export function createFetchClient(
  options: CreateFetchClientOptions,
): FetchClient {
  const { successCode = 0, ...fetchOptions } = options;
  const native = ofetch.create(fetchOptions);

  async function request<T>(
    url: string,
    requestOptions: RequestOptions = {},
  ): Promise<T> {
    let response: FetchResponse<ApiEnvelope<T>>;
    try {
      response = await native.raw<ApiEnvelope<T>>(url, {
        ...requestOptions,
        responseType: 'json',
      });
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
    const envelope = response._data;

    if (envelope?.code !== successCode) {
      throw new ApiError({
        code: envelope?.code,
        data: envelope,
        message: envelope?.message ?? 'Request failed',
        status: response.status,
      });
    }
    return envelope.data;
  }

  /**
   * Use `request` for the envelope-aware call (throws `ApiError`); use
   * `native` to drop down to the configured `ofetch` instance directly.
   */
  return {
    request,
    native,
  };
}

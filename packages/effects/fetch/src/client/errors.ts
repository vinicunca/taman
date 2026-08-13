import { FetchError } from 'ofetch';

interface ApiErrorInit {
  message: string;
  code?: number;
  status?: number;
  data?: unknown;
  cause?: unknown;
}

/**
 * Single error type surfaced by @taman/request.
 * - Business failure (envelope code !== successCode): `code` set, usually `status` 200.
 * - HTTP failure: `status` set; `code` only if the error body carried one.
 * - Network/transport failure: neither set; `cause` is the underlying FetchError.
 */
export class ApiError extends Error {
  readonly code?: number;
  readonly status?: number;
  readonly data?: unknown;

  constructor(init: ApiErrorInit) {
    super(init.message, { cause: init.cause });
    this.name = 'ApiError';
    this.code = init.code;
    this.status = init.status;
    this.data = init.data;
  }

  static fromUnknown(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    if (error instanceof FetchError) {
      const body = error.data as
        | { code?: unknown; message?: unknown }
        | undefined;
      return new ApiError({
        cause: error,
        code: typeof body?.code === 'number' ? body.code : undefined,
        data: error.data,
        message:
          typeof body?.message === 'string' && body.message.length > 0
            ? body.message
            : error.message,
        status: error.statusCode,
      });
    }
    return new ApiError({
      cause: error,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

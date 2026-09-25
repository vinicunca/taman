/** Test helpers for `./http` (not exported from the package). */

export interface RecordedCall {
  method: string;
  path: string;
  search: string;
  headers: Headers;
  credentials: RequestCredentials;
  body: string | null;
}

export type Route = (request: Request) => Response | Promise<Response>;

/** An in-process `fetch` that routes by pathname and records every call. */
export function createFakeFetch(routes: Record<string, Route>) {
  const calls: Array<RecordedCall> = [];

  const fetch: typeof globalThis.fetch = async (input, init) => {
    const request = new Request(input as RequestInfo, init);
    const url = new URL(request.url);
    calls.push({
      method: request.method,
      path: url.pathname,
      search: url.search,
      headers: request.headers,
      credentials: request.credentials,
      body: request.method === 'GET' || request.method === 'HEAD' ? null : await request.clone().text(),
    });
    const route = routes[url.pathname];
    return route ? route(request) : new Response('not found', { status: 404 });
  };

  return { fetch, calls };
}

/** Resolves after `ms`, or rejects with the abort reason if the request is aborted first. */
export function respondAfter(request: Request, ms: number, response: () => Response = () => Response.json({ late: true })): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(response()), ms);
    request.signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(request.signal.reason);
    });
  });
}

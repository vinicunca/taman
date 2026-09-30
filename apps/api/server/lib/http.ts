import { HTTPError } from 'nitro';

/**
 * Single chokepoint for thrown HTTP errors so the status/message shape stays
 * consistent across services. If this nitro/h3 beta changes the HTTPError
 * constructor, fix it here only.
 */
export function httpError({
  status,
  message,
  data,
}: {
  status: number;
  message: string;
  data?: unknown;
}): HTTPError {
  return new HTTPError({ status, message, data });
}

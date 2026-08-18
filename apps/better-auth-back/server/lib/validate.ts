import type { H3Event } from 'nitro';
import type { core, ZodType } from 'zod';
import { isString } from '@vinicunca/perkakas';
import { getQuery, getRouterParams, readBody } from 'nitro/h3';
import { httpError } from '#lib/http.ts';

/**
 * A missing required field surfaces as a type error ("expected string, received
 * undefined") because Zod runs the type check before `.min(1)`, so the field's
 * own message never fires. This maps that one case to the "<Field> is required"
 * wording the better-auth forms use.
 *
 * Returning undefined keeps Zod's default message; schema- and check-level
 * messages take precedence over this map, so per-field overrides still win.
 */
const parseContext: core.ParseContext<core.$ZodIssue> = {
  error: (issue) => {
    if (issue.code !== 'invalid_type' || issue.input !== undefined) {
      return undefined;
    }

    const field = issue.path?.at(-1);

    return isString(field) ? `${field} is required.` : undefined;
  },
};

/**
 * Parse with zod and let ZodError propagate — error.validation.ts converts it
 * to a 400 with field details.
 */
export async function readValidatedBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  return schema.parse(await readBody(event), parseContext);
}

export interface ValidatedBodyWithFiles<T> {
  data: T;
  files: Array<File>;
}

/**
 * Reads a body that may carry files alongside its JSON fields, so a client
 * never has to make two calls (upload, then create) for one user action.
 *
 * Accepts either shape:
 * - `multipart/form-data` with a `payload` part holding the JSON body and any
 *   number of file parts under `filesField`.
 * - a plain JSON body, in which case `files` is empty.
 *
 * The JSON travels as one `payload` part rather than as individual form
 * fields because `FormData` stringifies everything — numbers, booleans and
 * nested objects would all arrive as strings and no longer match the schema.
 * Keeping it as JSON means the same zod schema validates both shapes.
 */
export async function readValidatedBodyWithFiles<T>(
  event: H3Event,
  schema: ZodType<T>,
  filesField: string,
): Promise<ValidatedBodyWithFiles<T>> {
  const contentType = event.req.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return {
      data: await readValidatedBody(event, schema),
      files: [],
    };
  }

  const form = await event.req.formData();
  const payload = form.get('payload');

  let parsed: unknown = {};
  if (isString(payload)) {
    try {
      parsed = JSON.parse(payload);
    } catch {
      throw httpError({
        status: 400,
        message: 'Invalid `payload` part: expected JSON',
      });
    }
  }

  const files = form
    .getAll(filesField)
    .filter((entry): entry is File => entry instanceof File);

  return {
    data: schema.parse(parsed, parseContext),
    files,
  };
}

export function getValidatedQuery<T>(event: H3Event, schema: ZodType<T>): T {
  return schema.parse(getQuery(event), parseContext);
}

export function getValidatedRouterParams<T>(event: H3Event, schema: ZodType<T>): T {
  return schema.parse(getRouterParams(event), parseContext);
}

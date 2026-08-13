import { get, set } from '@taman-core/shared/utils';

type AnyRecord = Record<string, any>;

export function getPath(target: AnyRecord, path: string): any {
  return get(target, path);
}

export function setPath(target: AnyRecord, path: string, value: unknown): void {
  set(target, path, value);
}

function toSegments(path: string): Array<string> {
  return path.match(/[^.[\]]+/g) ?? [];
}

export function deletePath(target: AnyRecord, path: string): void {
  const segments = toSegments(path);
  if (segments.length === 0) {
    return;
  }
  let cursor: any = target;
  for (const segment of segments.slice(0, -1)) {
    if (cursor === null || typeof cursor !== 'object') {
      return;
    }
    cursor = cursor[segment];
  }
  if (cursor === null || cursor === undefined || typeof cursor !== 'object') {
    return;
  }
  const last = segments.at(-1)!;
  if (Array.isArray(cursor)) {
    cursor.splice(Number(last), 1);
  } else {
    delete cursor[last];
  }
}

function isPlainObject(value: unknown): value is AnyRecord {
  return (
    typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && Object.getPrototypeOf(value) !== null
  );
}

export function deepAssign(target: AnyRecord, source: AnyRecord): void {
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(target[key])) {
      deepAssign(target[key], value);
    } else {
      target[key] = value;
    }
  }
}

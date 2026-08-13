import { isDefined } from '@vinicunca/perkakas';
import { isFunction } from '@vue/shared';

/**
 * Checks whether the given value is undefined.
 *
 * @param value The value to check.
 * @returns True if the value is undefined, otherwise false.
 */
function isUndefined(value?: unknown): value is undefined {
  return value === undefined;
}

/**
 * Checks whether the given value is a boolean.
 * @param value
 * @returns True if the value is a boolean, otherwise false.
 */
function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks whether the given value is empty.
 *
 * The following are considered empty:
 * - null
 * - undefined
 * - an empty string
 * - an array with length 0
 * - a Map or Set with no elements
 * - an object with no own properties
 *
 * @param value The value to check.
 * @returns True if the value is empty, otherwise false.
 */
function isEmpty<T = unknown>(value?: T): value is T {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value) || isString(value)) {
    return value.length === 0;
  }

  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Checks whether the given string is a valid HTTP or HTTPS URL.
 *
 * @param url The string to check.
 * @return True if the string is a valid HTTP or HTTPS URL, otherwise false.
 */
function isHttpUrl(url?: string): boolean {
  if (!url) {
    return false;
  }
  // Test whether the URL starts with http:// or https://
  const httpRegex = /^https?:\/\/.*$/;
  return httpRegex.test(url);
}

/**
 * Checks whether the given value is the window object.
 *
 * @param value The value to check.
 * @returns True if the value is the window object, otherwise false.
 */
function isWindow(value: any): value is Window {
  return (
    typeof window !== 'undefined' && value !== null && value === value.window
  );
}

/**
 * Checks whether the current runtime environment is macOS.
 *
 * This function inspects navigator.userAgent.
 * If the string contains "macintosh" or "mac os x" (case-insensitive), the environment is treated as macOS.
 *
 * @returns True if the current environment is macOS, otherwise false.
 */
function isMacOs(): boolean {
  const macRegex = /macintosh|mac os x/i;
  return macRegex.test(navigator.userAgent);
}

/**
 * Checks whether the current runtime environment is Windows.
 *
 * This function inspects navigator.userAgent.
 * If the string contains "windows" or "win32" (case-insensitive), the environment is treated as Windows.
 *
 * @returns True if the current environment is Windows, otherwise false.
 */
function isWindowsOs(): boolean {
  const windowsRegex = /windows|win32/i;
  return windowsRegex.test(navigator.userAgent);
}

/**
 * Checks whether the given value is a finite number.
 * @param value
 */
function isNumber(value: any): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Returns the first value in the provided list that is neither `null` nor `undefined`.
 *
 * This function iterates over the input values and returns the first one that is
 * not strictly equal to `null` or `undefined`. If all values are either `null` or
 * `undefined`, it returns `undefined`.
 *
 * @template T - The type of the input values.
 * @param values - A list of values to evaluate.
 * @returns - The first value that is not `null` or `undefined`, or `undefined` if none are found.
 *
 * @example
 * // Returns 42 because it is the first non-null, non-undefined value.
 * getFirstNonNullOrUndefined(undefined, null, 42, 'hello'); // 42
 *
 * @example
 * // Returns 'hello' because it is the first non-null, non-undefined value.
 * getFirstNonNullOrUndefined(null, undefined, 'hello', 123); // 'hello'
 *
 * @example
 * // Returns undefined because all values are either null or undefined.
 * getFirstNonNullOrUndefined(undefined, null); // undefined
 */
function getFirstNonNullOrUndefined<T>(
  ...values: Array<null | T | undefined>
): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

export {
  getFirstNonNullOrUndefined,
  // isBoolean,
  // isEmpty,
  isFunction as isFunctionType,
  isHttpUrl,
  isMacOs,
  // isNumber,
  // isObject,
  // isString,
  isUndefined,
  isWindow,
  isWindowsOs,
};

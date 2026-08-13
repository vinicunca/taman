import type { ComputedRef, MaybeRef } from 'vue';

/**
 * Increment depth counter for type-level recursion
 */
type Increment<A extends Array<unknown>> = [...A, unknown];

/**
 * Recursively make all properties readonly
 */
type DeepReadonly<
  T,
  D extends number = 10,
  C extends Array<unknown> = [],
> = C['length'] extends D
  ? T
  : T extends object
    ? {
        readonly [P in keyof T]: DeepReadonly<T[P], D, Increment<C>>;
      }
    : T;

/**
 * Async function with arbitrary argument and return types
 */

type AnyPromiseFunction<T extends Array<any> = Array<any>, R = void> = (
  ...arg: T
) => PromiseLike<R>;

/**
 * Regular function with arbitrary argument and return types
 */
type AnyNormalFunction<T extends Array<any> = Array<any>, R = void> = (...arg: T) => R;

/**
 * Function with arbitrary argument and return types
 */
type AnyFunction<T extends Array<any> = Array<any>, R = void>
  = | AnyNormalFunction<T, R>
    | AnyPromiseFunction<T, R>;

/**
 * T | null wrapper
 */
type Nullable<T> = null | T;

/**
 * T excluding null and undefined
 */
type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * String-keyed object
 */
type Recordable<T> = Record<string, T>;

/**
 * Readonly string-keyed object
 */
interface ReadonlyRecordable<T = any> {
  readonly [key: string]: T;
}

/**
 * Return type of setTimeout
 */
type TimeoutHandle = ReturnType<typeof setTimeout>;

/**
 * Return type of setInterval
 */
type IntervalHandle = ReturnType<typeof setInterval>;

/**
 * Maybe a computed ref or a getter function
 *
 */
type MaybeReadonlyRef<T> = (() => T) | ComputedRef<T>;

/**
 * Maybe a ref, a plain value, or a getter function
 *
 */
type MaybeComputedRef<T> = MaybeReadonlyRef<T> | MaybeRef<T>;

type Merge<O extends object, T extends object> = {
  [K in keyof O | keyof T]: K extends keyof T
    ? T[K]
    : K extends keyof O
      ? O[K]
      : never;
};

/**
 * T = [
 *  { name: string; age: number; },
 *  { sex: 'male' | 'female'; age: string }
 * ]
 * =>
 * MergeAll<T> = {
 *  name: string;
 *  sex: 'male' | 'female';
 *  age: string
 * }
 */
type MergeAll<
  T extends Array<object>,
  R extends object = Record<string, any>,
> = T extends [infer F extends object, ...infer Rest extends Array<object>]
  ? MergeAll<Rest, Merge<R, F>>
  : R;

type EmitType = (name: Name, ...args: Array<any>) => void;

type MaybePromise<T> = Promise<T> | T;

/**
 * Remove the open index signature (`[key: string]: any`) from an interface.
 * Enables excess property checking on otherwise loose third-party types.
 */
type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K]: T[K];
};

export type {
  AnyFunction,
  AnyNormalFunction,
  AnyPromiseFunction,
  DeepReadonly,
  EmitType,
  IntervalHandle,
  MaybeComputedRef,
  MaybePromise,
  MaybeReadonlyRef,
  Merge,
  MergeAll,
  NonNullable,
  Nullable,
  ReadonlyRecordable,
  Recordable,
  RemoveIndexSignature,
  TimeoutHandle,
};

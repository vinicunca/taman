/**
 * Deduplicate an array of objects by a specified field.
 * @param arr Array of objects to deduplicate
 * @param key Field name used for deduplication
 * @returns Deduplicated array
 */
function uniqueByField<T>(arr: Array<T>, key: keyof T): Array<T> {
  const seen = new Map<any, T>();
  return arr.filter((item) => {
    const value = item[key];
    return seen.has(value) ? false : (seen.set(value, item), true);
  });
}

export { uniqueByField };

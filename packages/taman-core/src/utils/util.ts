export function bindMethods<T extends object>(instance: T): void {
  const prototype = Object.getPrototypeOf(instance);
  const propertyNames = Object.getOwnPropertyNames(prototype);

  propertyNames.forEach((propertyName) => {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
    const propertyValue = instance[propertyName as keyof T];

    if (
      typeof propertyValue === 'function'
      && propertyName !== 'constructor'
      && descriptor
      && !descriptor.get
      && !descriptor.set
    ) {
      instance[propertyName as keyof T] = propertyValue.bind(instance);
    }
  });
}

/**
 * Get a nested field value from an object.
 * @param obj Object to read from
 * @param path Dot-separated path to the field
 * @returns Field value, or undefined when not found
 */
export function getNestedValue<T>(obj: T, path: string): any {
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error('Path must be a non-empty string');
  }
  // Split the path string by "."
  const keys = path.split('.') as Array<number | string>;

  let current: any = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key as keyof typeof current];
  }

  return current;
}

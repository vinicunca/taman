/**
 * True when at least one of `required` is present in `available` — the
 * shared set-intersection check used for both role-based and code-based
 * access checks (useAccess's composable path and the v-access directive's
 * path independently resolve their own `available` list, then both call
 * this same logic).
 */
export function matchesAnyRole(
  available: Array<string>,
  required: Array<string>,
): boolean {
  const availableSet = new Set(available);
  return required.some((item) => availableSet.has(item));
}

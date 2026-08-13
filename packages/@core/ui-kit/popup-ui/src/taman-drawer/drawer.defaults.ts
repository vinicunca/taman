import type { TamanDrawerProps } from './drawer.types';

/**
 * App-wide default TamanDrawerProps, written once by <TamanDrawerProvider>'s
 * own props at setup time (before its registry entries mount) and read by
 * useTamanDrawer at the lowest merge priority. Provider and callers are
 * siblings in the component tree, so this is a plain module-level object
 * rather than provide/inject.
 */
export const drawerDefaults: Partial<TamanDrawerProps> = {};

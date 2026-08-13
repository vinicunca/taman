import type { DialogProps } from './dialog.types';

/**
 * App-wide default DialogProps, written once by <TamanDialogProvider>'s own
 * props at setup time (before its registry entries mount) and read by
 * useTamanDialog at the lowest merge priority. Provider and callers are
 * siblings in the component tree, so this is a plain module-level object
 * rather than provide/inject.
 */
export const dialogDefaults: Partial<DialogProps> = {};

export {};

/**
 * Test-only hooks exposed by the app when `__TAMAN_LAYOUT_E2E__` is set
 * (see `fixtures/layout.ts` init script).
 */
interface TamanLayoutTestApi {
  resetPreferences: () => void | Promise<void>;
  updatePreferences: (
    patch: Record<string, unknown>,
  ) => void | Promise<void>;
}

declare global {
  interface Window {
    __TAMAN_LAYOUT_E2E__?: boolean;
    __TAMAN_LAYOUT_TEST__?: TamanLayoutTestApi;
  }
}

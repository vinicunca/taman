import type NProgress from 'nprogress';

// NProgress instance; null until loaded
let nProgressInstance: null | typeof NProgress = null;

/**
 * Dynamically load and configure the NProgress library.
 * Returns the cached instance when already loaded; otherwise imports and configures it.
 *
 * @returns Promise that resolves to the NProgress instance.
 */
async function loadNprogress() {
  if (nProgressInstance) {
    return nProgressInstance;
  }
  // CommonJS package: Node exposes it as `default`; bundlers may also spread it.
  const module = await import('nprogress');
  nProgressInstance = (module as { default?: typeof NProgress }).default ?? module;
  nProgressInstance.configure({
    showSpinner: true,
    speed: 300,
  });
  return nProgressInstance;
}

/**
 * Start the progress bar.
 * Loads NProgress first, then calls start().
 */
async function startProgress() {
  const nprogress = await loadNprogress();
  nprogress?.start();
}

/**
 * Stop and hide the progress bar.
 * Loads NProgress first, then calls done().
 */
async function stopProgress() {
  const nprogress = await loadNprogress();
  nprogress?.done();
}

export { startProgress, stopProgress };

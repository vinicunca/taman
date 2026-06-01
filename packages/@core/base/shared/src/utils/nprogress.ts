import type NProgress from 'nprogress';

// Create a variable to store the NProgress instance, initialized to null
let nProgressInstance: null | typeof NProgress = null;

/**
 * Dynamically load the NProgress library and configure it.
 * This function first checks if the NProgress library has already been loaded, and if it has, it returns the NProgress instance.
 * Otherwise, it dynamically imports the NProgress library, configures it, and then returns the NProgress instance.
 *
 * @returns The Promise object of the NProgress instance.
 */
async function loadNprogress() {
  if (nProgressInstance) {
    return nProgressInstance;
  }
  nProgressInstance = await import('nprogress');
  nProgressInstance.configure({
    showSpinner: true,
    speed: 300,
  });
  return nProgressInstance;
}

/**
 * Start displaying the progress bar.
 * This function first loads the NProgress library, then calls the start method of NProgress to start displaying the progress bar.
 */
async function startProgress() {
  const nprogress = await loadNprogress();
  nprogress?.start();
}

/**
 * Stop displaying the progress bar and hide the progress bar.
 * This function first loads the NProgress library, then calls the done method of NProgress to stop and hide the progress bar.
 */
async function stopProgress() {
  const nprogress = await loadNprogress();
  nprogress?.done();
}

export { startProgress, stopProgress };

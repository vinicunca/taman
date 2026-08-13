/**
 * Removes and tears down the global loading overlay.
 * Lives here instead of inside the app tag in index.html to avoid a harsh cut-off
 * when paint is fast (which can flash). Hides via CSS transition first, then
 * removes the node after the animation ends. Adds a bit of code; see
 * https://doc.vben.pro/guide/in-depth/loading.html for custom loading.
 */
export function unmountGlobalLoading() {
  // Find the global loading element
  const loadingElement = document.querySelector('#__app-loading__');

  if (loadingElement) {
    // Add hide class to run the transition
    loadingElement.classList.add('hidden');

    // Find injected loading elements to remove
    const injectLoadingElements = document.querySelectorAll(
      '[data-app-loading^="inject"]',
    );

    // After the transition, remove loading and injected loading nodes
    loadingElement.addEventListener(
      'transitionend',
      () => {
        loadingElement.remove();
        injectLoadingElements.forEach((el) => el.remove());
      },
      { once: true },
    );
  }
}

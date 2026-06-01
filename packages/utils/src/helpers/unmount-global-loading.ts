/**
 * Remove and destroy the loading
 * It is not placed in the app tag in index.html because it is not too hard, and the rendering may be too fast and may cause flickering
 * By adding a css animation to hide first, and then removing the loading node after the animation ends, the experience can be improved
 * The bad thing is that it会增加一些代码量
 * The custom loading can be seen: https://doc.vben.pro/guide/in-depth/loading.html
 */
export function unmountGlobalLoading() {
  // Find the global loading element
  const loadingElement = document.querySelector('#__app-loading__');

  if (loadingElement) {
    // Add the hidden class, trigger the transition animation
    loadingElement.classList.add('hidden');

    // Find all the injection loading elements that need to be removed
    const injectLoadingElements = document.querySelectorAll(
      '[data-app-loading^="inject"]',
    );

    // When the transition animation ends, remove the loading element and all the injected loading elements
    loadingElement.addEventListener(
      'transitionend',
      () => {
        loadingElement.remove(); // Remove the loading element
        injectLoadingElements.forEach((el) => {
          el.remove();
        }); // Remove all the injected loading elements
      },
      { once: true },
    ); // Ensure the event is only triggered once
  }
}

/**
 * Load a JavaScript file
 * @param src Script URL
 */
function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      // Already loaded; resolve immediately
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () =>
      reject(new Error(`Failed to load script: ${src}`)));
    document.head.append(script);
  });
}

export { loadScript };

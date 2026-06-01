interface OpenWindowOptions {
  noopener?: boolean;
  noreferrer?: boolean;
  target?: '_blank' | '_parent' | '_self' | '_top' | string;
}

/**
 * Open a URL in a new window.
 *
 * @param url - The URL to open.
 * @param options - The options to open the window.
 */
function openWindow(url: string, options: OpenWindowOptions = {}): void {
  // Deconstruct and set default values
  const { noopener = true, noreferrer = true, target = '_blank' } = options;

  // Create a feature string based on the options
  const features = [noopener && 'noopener=yes', noreferrer && 'noreferrer=yes']
    .filter(Boolean)
    .join(',');

  // Open the window
  window.open(url, target, features);
}

/**
 * Open a route in a new window.
 * @param path
 */
function openRouteInNewWindow(path: string) {
  const { hash, origin } = location;
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${origin}${hash && !fullPath.startsWith('/#') ? '/#' : ''}${fullPath}`;
  openWindow(url, { target: '_blank' });
}

export { openRouteInNewWindow, openWindow };

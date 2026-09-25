interface OpenWindowOptions {
  noopener?: boolean;
  noreferrer?: boolean;
  target?: '_blank' | '_parent' | '_self' | '_top' | string;
}

/**
 * Open a URL in a new window.
 *
 * @param url URL to open.
 * @param options Window open options.
 */
function openWindow(url: string, options: OpenWindowOptions = {}): void {
  // Destructure with defaults
  const { noopener = true, noreferrer = true, target = '_blank' } = options;

  // Build the feature string from options
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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { openWindow } from '../window';

describe('openWindow', () => {
  // Preserve original window.open
  let originalOpen: typeof window.open;

  beforeEach(() => {
    originalOpen = window.open;
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  it('should call window.open with correct arguments', () => {
    const url = 'https://example.com';
    const options = { noopener: true, noreferrer: true, target: '_blank' };

    window.open = vi.fn();

    // Call the function
    openWindow(url, options);

    // Verify window.open was called correctly
    expect(window.open).toHaveBeenCalledWith(
      url,
      options.target,
      'noopener=yes,noreferrer=yes',
    );
  });
});

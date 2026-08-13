interface VisibleDomRect {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

/**
 * Get the visible portion of an element within the viewport
 * @param element
 */
function getElementVisibleRect(
  element?: HTMLElement | null | undefined,
): VisibleDomRect {
  if (!element) {
    return {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
    };
  }
  const rect = element.getBoundingClientRect();
  const viewHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight,
  );

  const top = Math.max(rect.top, 0);
  const bottom = Math.min(rect.bottom, viewHeight);

  const viewWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth,
  );

  const left = Math.max(rect.left, 0);
  const right = Math.min(rect.right, viewWidth);

  // Return an empty rect if the element is fully outside the viewport
  if (top >= viewHeight || bottom <= 0 || left >= viewWidth || right <= 0) {
    return {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
    };
  }

  return {
    bottom,
    height: Math.max(0, bottom - top),
    left,
    right,
    top,
    width: Math.max(0, right - left),
  };
}

function getScrollbarWidth() {
  const scrollDiv = document.createElement('div');

  scrollDiv.style.visibility = 'hidden';
  scrollDiv.style.overflow = 'scroll';
  scrollDiv.style.position = 'absolute';
  scrollDiv.style.top = '-9999px';

  document.body.append(scrollDiv);

  const innerDiv = document.createElement('div');
  scrollDiv.append(innerDiv);

  const scrollbarWidth = scrollDiv.offsetWidth - innerDiv.offsetWidth;

  scrollDiv.remove();
  return scrollbarWidth;
}

function needsScrollbar() {
  const doc = document.documentElement;
  const body = document.body;

  // Check body overflow-y style
  const overflowY = window.getComputedStyle(body).overflowY;

  // Explicit scroll/auto overflow means compare scroll height to viewport height
  if (overflowY === 'scroll' || overflowY === 'auto') {
    return doc.scrollHeight > window.innerHeight;
  }

  // Otherwise decide based on scrollHeight vs innerHeight
  return doc.scrollHeight > window.innerHeight;
}

function triggerWindowResize(): void {
  // Create a new resize event
  const resizeEvent = new Event('resize');

  // Dispatch it on window
  window.dispatchEvent(resizeEvent);
}

export {
  getElementVisibleRect,
  getScrollbarWidth,
  needsScrollbar,
  triggerWindowResize,
  type VisibleDomRect,
};

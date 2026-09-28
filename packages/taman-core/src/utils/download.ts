import { openWindow } from './window';

interface DownloadOptions<T = string> {
  fileName?: string;
  source: T;
  target?: string;
}

const DEFAULT_FILENAME = 'downloaded_file';

/**
 * Download a file from a URL, including cross-origin URLs.
 * @throws {Error} When the download fails
 */
export async function downloadFileFromUrl({
  fileName,
  source,
  target = '_blank',
}: DownloadOptions): Promise<void> {
  if (!source || typeof source !== 'string') {
    throw new Error('Invalid URL.');
  }

  const isChrome = window.navigator.userAgent.toLowerCase().includes('chrome');
  const isSafari = window.navigator.userAgent.toLowerCase().includes('safari');

  if (/iP/.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!');
    return;
  }

  if (isChrome || isSafari) {
    triggerDownload(source, resolveFileName(source, fileName));
    return;
  }
  if (!source.includes('?')) {
    source += '?download';
  }

  openWindow(source, { target });
}

/**
 * Download a file from Base64 data.
 */
export function downloadFileFromBase64({ fileName, source }: DownloadOptions) {
  if (!source || typeof source !== 'string') {
    throw new Error('Invalid Base64 data.');
  }

  const resolvedFileName = fileName || DEFAULT_FILENAME;
  triggerDownload(source, resolvedFileName);
}

/**
 * Download an image file from an image URL.
 */
export async function downloadFileFromImageUrl({
  fileName,
  source,
}: DownloadOptions) {
  const base64 = await urlToBase64(source);
  downloadFileFromBase64({ fileName, source: base64 });
}

/**
 * Download a file from a Blob.
 */
export function downloadFileFromBlob({
  fileName = DEFAULT_FILENAME,
  source,
}: DownloadOptions<Blob>): void {
  if (!(source instanceof Blob)) {
    throw new TypeError('Invalid Blob data.');
  }

  const url = URL.createObjectURL(source);
  triggerDownload(url, fileName);
}

/**
 * Download a file from a Blob, string, or other BlobPart.
 */
export function downloadFileFromBlobPart({
  fileName = DEFAULT_FILENAME,
  source,
}: DownloadOptions<BlobPart>): void {
  // Convert non-Blob data to a Blob
  const blob
    = source instanceof Blob
      ? source
      : new Blob([source], { type: 'application/octet-stream' });

  // Create an object URL and trigger the download
  const url = URL.createObjectURL(blob);
  triggerDownload(url, fileName);
}

/**
 * img url to base64
 * @param url
 */
export function urlToBase64(url: string, mineType?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('CANVAS') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d');
    const img = new Image();
    img.crossOrigin = '';
    img.addEventListener('load', () => {
      if (!canvas || !ctx) {
        return reject(new Error('Failed to create canvas.'));
      }
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL(mineType || 'image/png');
      canvas = null;
      resolve(dataURL);
    });
    img.src = url;
  });
}

/**
 * Generic download trigger.
 * @param href Download URL
 * @param fileName File name; auto-detected when omitted
 * @param revokeDelay Delay before revoking the URL (milliseconds)
 */
export function triggerDownload(
  href: string,
  fileName: string | undefined,
  revokeDelay: number = 100,
): void {
  const defaultFileName = 'downloaded_file';
  const finalFileName = fileName || defaultFileName;

  const link = document.createElement('a');
  link.href = href;
  link.download = finalFileName;
  link.style.display = 'none';

  if (link.download === undefined) {
    link.setAttribute('target', '_blank');
  }

  document.body.append(link);
  link.click();
  link.remove();

  // Revoke the temporary URL to free memory
  setTimeout(() => URL.revokeObjectURL(href), revokeDelay);
}

function resolveFileName(url: string, fileName?: string): string {
  return fileName || url.slice(url.lastIndexOf('/') + 1) || DEFAULT_FILENAME;
}

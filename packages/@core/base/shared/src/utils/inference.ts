/**
 * Check if the current operating system is Mac OS.
 *
 * This function checks the navigator.userAgent string to determine the current operating system.
 * If the userAgent string contains "macintosh" or "mac os x" (case-insensitive), it is considered that the current environment is Mac OS.
 *
 * @returns If the current environment is Mac OS, returns true, otherwise returns false.
 */
function isMacOs(): boolean {
  const macRegex = /macintosh|mac os x/i;
  return macRegex.test(navigator.userAgent);
}

export {
  isMacOs,
};

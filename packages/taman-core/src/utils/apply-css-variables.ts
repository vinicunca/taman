/**
 * Updates CSS variables.
 * @param variables Map of CSS variable names to new values
 */
export function applyCssVariables(
  variables: { [key: string]: string },
  id = 'taman-styles__',
): void {
  // Previously, `setTimeout` was used to delay the insertion of the created style tag.
  // If called repeatedly within the same macrotask (e.g., initializing preferences followed by restoring user preferences),
  // `querySelector` would fail to find the tag before it was inserted, leading to the creation of duplicate tags with the same ID.
  // At runtime, only the first tag would be updated, yet the second tag (containing the old value) would win the cascade,
  // causing theme color changes to fail for some components until the page was refreshed.
  // We have switched to synchronous insertion to eliminate this race condition and simultaneously clean up any legacy duplicate tags.
  const existingStyles = document.querySelectorAll<HTMLElement>(`#${id}`);
  existingStyles.forEach((element, index) => {
    if (index > 0) {
      element.remove();
    }
  });

  let styleElement = existingStyles[0] ?? null;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = id;
    document.head.append(styleElement);
  }

  // Build CSS text for the variables to update
  let cssText = ':root {';
  // eslint-disable-next-line no-restricted-syntax
  for (const key in variables) {
    if (Object.hasOwn(variables, key)) {
      cssText += `${key}: ${variables[key]};`;
    }
  }
  cssText += '}';

  // Assign the CSS text to the inline stylesheet
  styleElement.textContent = cssText;
}

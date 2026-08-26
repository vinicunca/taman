/**
 * Updates CSS variables.
 * @param variables Map of CSS variable names to new values
 */
export function applyCssVariables(
  variables: { [key: string]: string },
  id = 'taman-styles__',
): void {
  // Get or create the inline stylesheet element
  const styleElement
    = document.querySelector(`#${id}`) || document.createElement('style');

  styleElement.id = id;

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

  // Append the inline stylesheet to the document head
  if (!document.querySelector(`#${id}`)) {
    setTimeout(() => {
      document.head.append(styleElement);
    });
  }
}

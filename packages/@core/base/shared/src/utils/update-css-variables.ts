/**
 * Update the CSS variables
 * @param variables The mapping of the CSS variables to be updated and their new values
 */
function updateCSSVariables(
  variables: { [key: string]: string },
  id = '__taman-styles__',
): void {
  // Get or create the inline style element
  const styleElement
    = document.querySelector(`#${id}`) || document.createElement('style');

  styleElement.id = id;

  // Build the style text of the CSS variables to be updated
  const cssText = `:root {${Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('')}}`;

  // Assign the style text to the inline style element
  styleElement.textContent = cssText;

  // Add the inline style element to the document head
  if (!document.querySelector(`#${id}`)) {
    setTimeout(() => {
      document.head.append(styleElement);
    });
  }
}

export { updateCSSVariables };

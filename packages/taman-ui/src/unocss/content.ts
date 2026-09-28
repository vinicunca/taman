/**
 * Matches taman-ui's compiled components in `node_modules`. UnoCSS only
 * extracts classes from `.vue`-style files by default, so add this to
 * `content.pipeline.include` or the components' own classes are not generated.
 */
export const TAMAN_UI_CONTENT = /@vinicunca[\\/]taman-ui[\\/]dist[\\/].*\.mjs$/;

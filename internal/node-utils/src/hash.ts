import { createHash } from 'node:crypto';

/**
 * Generate a hash based on the content, customizable length
 * @param content
 * @param hashLSize
 */
function generatorContentHash(content: string, hashLSize?: number) {
  // eslint-disable-next-line sonar/hashing
  const hash = createHash('md5').update(content, 'utf8').digest('hex');

  if (hashLSize) {
    return hash.slice(0, hashLSize);
  }

  return hash;
}

export { generatorContentHash };

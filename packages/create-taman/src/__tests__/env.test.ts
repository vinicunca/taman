import { describe, expect, it } from 'vitest';
import { addEnvFiles } from '../env';

describe('addEnvFiles', () => {
  it('copies every .env example to its real name without overwriting', () => {
    const files = new Map([
      ['apps/web/.env.example', 'A=1\n'],
      ['apps/web/.env.development.example', 'B=2\n'],
      ['apps/api/.env.example', 'C=3\n'],
      ['apps/api/.env', 'KEEP=1\n'],
      ['docs/config.example', 'not env\n'],
    ]);

    const result = addEnvFiles(files);

    expect(result.get('apps/web/.env')).toBe('A=1\n');
    expect(result.get('apps/web/.env.development')).toBe('B=2\n');
    expect(result.get('apps/api/.env')).toBe('KEEP=1\n');
    expect(result.has('docs/config')).toBe(false);
  });
});

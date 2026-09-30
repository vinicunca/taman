import { describe, expect, it } from 'vitest';
import { addCatalogEntries, removeWorkspacePackages } from '../workspace-yaml';

const YAML = [
  'packages:',
  '  - internal/*',
  '  - apps/*',
  '',
  'catalog:',
  '  \'@types/node\': ^26.6.2',
  '  vue: ^3.5.0',
  '',
  'overrides:',
  '  vue: \'catalog:\'',
  '',
].join('\n');

describe('addCatalogEntries', () => {
  it('inserts entries in alphabetical position inside the catalog block', () => {
    const result = addCatalogEntries(YAML, new Map([['@vinicunca/taman-core', '^0.1.0'], ['@acme/a', '^1.0.0']]));

    expect(result.split('\n').slice(4, 9)).toEqual([
      'catalog:',
      '  \'@acme/a\': ^1.0.0',
      '  \'@types/node\': ^26.6.2',
      '  \'@vinicunca/taman-core\': ^0.1.0',
      '  vue: ^3.5.0',
    ]);
  });

  it('replaces an entry that already exists', () => {
    const result = addCatalogEntries(YAML, new Map([['vue', '^3.6.0']]));

    expect(result).toContain('  vue: ^3.6.0');
    expect(result).not.toContain('  vue: ^3.5.0');
  });

  it('fails without a catalog block', () => {
    expect(() => addCatalogEntries('packages:\n  - apps/*\n', new Map([['a', '^1.0.0']]))).toThrow(/catalog/);
  });
});

describe('removeWorkspacePackages', () => {
  it('drops the listed package globs only', () => {
    expect(removeWorkspacePackages(YAML, ['internal/*'])).not.toContain('- internal/*');
    expect(removeWorkspacePackages(YAML, ['internal/*'])).toContain('  - apps/*');
  });
});

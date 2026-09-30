import { describe, expect, it } from 'vitest';
import { listPackages, rewritePublishedDeps } from '../published-deps';
import { removeFiles } from '../remove';

const pkg = (value: object) => `${JSON.stringify(value, null, 2)}\n`;

function snapshot() {
  return new Map([
    ['package.json', pkg({ name: '@taman/monorepo', private: true, devDependencies: { '@vinicunca/tsconfig': 'workspace:*' } })],
    ['pnpm-workspace.yaml', 'packages:\n  - apps/*\n\ncatalog:\n  vue: ^3.5.0\n'],
    ['internal/tsconfig/package.json', pkg({ name: '@vinicunca/tsconfig', version: '1.0.1' })],
    ['packages/secret/package.json', pkg({ name: '@taman/secret', version: '1.0.0', private: true })],
    ['apps/web/package.json', pkg({ name: '@taman/web', private: true, dependencies: { '@vinicunca/tsconfig': 'workspace:^', '@taman/api-contract': 'workspace:*', 'vue': 'catalog:' } })],
    ['packages/api-contract/package.json', pkg({ name: '@taman/api-contract', version: '0.1.0', private: true })],
  ]);
}

describe('listPackages', () => {
  it('indexes every package.json by name, skipping node_modules', () => {
    const files = snapshot();
    files.set('node_modules/x/package.json', pkg({ name: 'x', version: '1.0.0' }));

    const packages = listPackages(files);

    expect(packages.get('@vinicunca/tsconfig')).toEqual({ path: 'internal/tsconfig/package.json', private: false, version: '1.0.1' });
    expect(packages.has('x')).toBe(false);
  });
});

describe('rewritePublishedDeps', () => {
  it('moves removed published packages to catalog versions', () => {
    const before = snapshot();
    const after = removeFiles(before, ['internal/**']);

    const { files, errors } = rewritePublishedDeps(before, after);

    expect(errors).toEqual([]);
    expect(JSON.parse(files.get('apps/web/package.json') as string).dependencies).toEqual({
      '@taman/api-contract': 'workspace:*',
      '@vinicunca/tsconfig': 'catalog:',
      'vue': 'catalog:',
    });
    expect(JSON.parse(files.get('package.json') as string).devDependencies['@vinicunca/tsconfig']).toBe('catalog:');
    expect(files.get('pnpm-workspace.yaml')).toContain('  \'@vinicunca/tsconfig\': ^1.0.1');
  });

  it('reports a workspace dependency on a removed private package', () => {
    const before = snapshot();
    const after = removeFiles(before, ['packages/api-contract/**']);

    const { errors } = rewritePublishedDeps(before, after);

    expect(errors).toEqual([
      'apps/web/package.json: dependencies.@taman/api-contract is "workspace:*" but @taman/api-contract is not in the generated project',
    ]);
  });
});

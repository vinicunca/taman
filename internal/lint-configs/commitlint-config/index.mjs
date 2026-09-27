import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { getPackagesSync } from '@vinicunca/node-utils';

const DEFAULT_SCOPES = ['project', 'style', 'lint', 'ci', 'dev', 'deploy', 'other'];

/**
 * Package names usable as scopes. Inside a pnpm workspace this is every
 * workspace package; anywhere else (npm/yarn project, no lockfile yet) it is
 * the project's own package name, instead of throwing.
 * @param cwd Directory to start package discovery from.
 */
function getPackageScopes(cwd) {
  let names;
  try {
    names = getPackagesSync(cwd).packages.map((pkg) => pkg.packageJson.name);
  } catch {
    try {
      const { name } = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
      names = name ? [name] : [];
    } catch {
      names = [];
    }
  }

  // Accept `@vinicunca/vite-config` and its short form `vite-config`
  return names.flatMap((name) => {
    const short = name.replace(/^@[^/]+\//, '');
    return short === name ? [name] : [name, short];
  });
}

/**
 * Default scope for the cz-git prompt, derived from a modified `src/<dir>`
 * path in single-package repos. Undefined when git is unavailable.
 */
function getDefaultPromptScope() {
  let status;
  try {
    status = execSync('git status --porcelain', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    return undefined;
  }

  return status
    .trim()
    .split('\n')
    .find((r) => r.includes('M  src'))
    ?.replaceAll(/(\/)/g, '%%')
    ?.match(/src%%((\w|-)*)/)?.[1]
    ?.replace(/s$/, '');
}

/**
 * Build the commitlint + cz-git config. Types live in index.d.ts.
 * @param options `cwd` for package discovery; `scopes` replaces the
 * non-package scopes (default: project, style, lint, ci, dev, deploy, other).
 * Package names are always allowed.
 */
function defineConfig(options = {}) {
  const { cwd = process.cwd(), scopes = DEFAULT_SCOPES } = options;
  const allowedScopes = [...new Set([...getPackageScopes(cwd), ...scopes])];
  const scopeComplete = getDefaultPromptScope();

  return {
    extends: ['@commitlint/config-conventional'],
    plugins: ['commitlint-plugin-function-rules'],
    prompt: {
      /** @use `pnpm commit :f` */
      alias: {
        b: 'build: bump dependencies',
        c: 'chore: update config',
        f: 'docs: fix typos',
        r: 'docs: update README',
        s: 'style: update code format',
      },
      allowCustomIssuePrefixs: false,
      // scopes: [...scopes, 'mock'],
      allowEmptyIssuePrefixs: false,
      customScopesAlign: scopeComplete ? 'bottom' : 'top',
      defaultScope: scopeComplete,
      // English
      typesAppend: [
        { name: 'workflow: workflow improvements', value: 'workflow' },
        { name: 'types:    type definition file changes', value: 'types' },
      ],
    },
    rules: {
      /**
       * type[scope]: [function] description
       *
       * ^^^^^^^^^^^^^^ empty line.
       * - Something here
       */
      'body-leading-blank': [2, 'always'],
      /**
       * type[scope]: [function] description
       *
       * - something here
       *
       * ^^^^^^^^^^^^^^
       */
      'footer-leading-blank': [1, 'always'],
      /**
       * type[scope]: [function] description
       *      ^^^^^
       */
      'function-rules/scope-enum': [
        2, // level: error
        'always',
        (parsed) => {
          if (!parsed.scope || allowedScopes.includes(parsed.scope)) {
            return [true];
          }

          return [false, `scope must be one of ${allowedScopes.join(', ')}`];
        },
      ],
      /**
       * type[scope]: [function] description [No more than 108 characters]
       *      ^^^^^
       */
      'header-max-length': [2, 'always', 108],

      'scope-enum': [0],
      'subject-case': [0],
      'subject-empty': [2, 'never'],
      'type-empty': [2, 'never'],
      /**
       * type[scope]: [function] description
       * ^^^^
       */
      'type-enum': [
        2,
        'always',
        [
          'feat',
          'fix',
          'perf',
          'style',
          'docs',
          'test',
          'refactor',
          'build',
          'ci',
          'chore',
          'revert',
          'types',
          'release',
        ],
      ],
    },
  };
}

export { defineConfig };

export default defineConfig();

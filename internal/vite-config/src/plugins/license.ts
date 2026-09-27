import type { PluginOption } from 'vite';

import type { LicensePluginOptions } from '../typing';

import { EOL } from 'node:os';

import { formatNow, readPackageJSON } from '@vinicunca/node-utils';

/**
 * Injects a license/copyright banner into build output.
 * Fields missing from `options` fall back to the consumer's package.json;
 * empty fields are left out of the banner.
 */
async function viteLicensePlugin(
  options: LicensePluginOptions = {},
  root = process.cwd(),
): Promise<PluginOption | undefined> {
  const {
    author: pkgAuthor,
    description = '',
    homepage = '',
    license: pkgLicense,
    name: pkgName,
    version = '',
  } = await readPackageJSON(root);

  const pkgAuthorObject = typeof pkgAuthor === 'object' ? pkgAuthor : undefined;

  const {
    author = pkgAuthorObject?.name ?? (pkgAuthor as string | undefined),
    contact = pkgAuthorObject?.email,
    copyright,
    license = pkgLicense,
    name = pkgName,
  } = options;

  return {
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      handler(_options, bundle) {
        const date = formatNow('YYYY-MM-DD ');
        const lines = [
          name,
          version && `Version: ${version}`,
          author && `Author: ${author}`,
          copyright,
          license && `License: ${license}`,
          description && `Description: ${description}`,
          `Date Created: ${date}`,
          homepage && `Homepage: ${homepage}`,
          contact && `Contact: ${contact}`,
        ].filter(Boolean);
        const copyrightText = `/*!\n${lines.map((line) => `  * ${line}`).join('\n')}\n*/`;

        for (const [, fileContent] of Object.entries(bundle)) {
          if (fileContent.type === 'chunk' && fileContent.isEntry) {
            // Prepend copyright banner
            const content = fileContent.code;
            const updatedContent = `${copyrightText}${EOL}${content}`;
            // Update bundle chunk
            fileContent.code = updatedContent;
          }
        }
      },
      order: 'post',
    },
    name: 'vite:license',
  };
}

export { viteLicensePlugin };

import type { PluginOption } from 'vite';

import { EOL } from 'node:os';

import { formatNow, readPackageJSON } from '@taman/node-utils';

/**
 * Injects a license/copyright banner into build output
 */
async function viteLicensePlugin(
  root = process.cwd(),
): Promise<PluginOption | undefined> {
  const {
    description = '',
    homepage = '',
    version = '',
  } = await readPackageJSON(root);

  return {
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      handler(_options, bundle) {
        const date = formatNow('YYYY-MM-DD ');
        const copyrightText = `/*!
  * Taman Admin
  * Version: ${version}
  * Author: praburangki
  * Copyright (C) 2024 Vinicunca
  * License: MIT License
  * Description: ${description}
  * Date Created: ${date}
  * Homepage: ${homepage}
  * Contact: praburangki@gmail.com
*/
              `.trim();

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

import type { PluginOption } from 'vite';

import { EOL } from 'node:os';

import { dateUtil, readPackageJSON } from '@taman/node-utils';

/**
 * Injects a license/copyright banner into build output
 * @returns
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
        const date = dateUtil().format('YYYY-MM-DD ');
        const copyrightText = `/*!
  * Vben Admin
  * Version: ${version}
  * Author: vben
  * Copyright (C) 2024 Vben
  * License: MIT License
  * Description: ${description}
  * Date Created: ${date}
  * Homepage: ${homepage}
  * Contact: ann.vben@gmail.com
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

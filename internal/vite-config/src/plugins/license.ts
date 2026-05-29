import type { PluginOption } from 'vite';

import { EOL } from 'node:os';
import { DateFormatter, getLocalTimeZone, now } from '@internationalized/date';
import { readPackageJSON } from '@taman/node-utils';

/**
 * Used to inject copyright information
 */
async function viteLicensePlugin(
  root = process.cwd(),
): Promise<PluginOption | undefined> {
  const {
    description = '',
    homepage = '',
    version = '',
  } = await readPackageJSON(root);

  const buildTimeFormatter = new DateFormatter('sv-SE', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  return {
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      handler(_options, bundle) {
        const dateCreated = buildTimeFormatter.format(now(getLocalTimeZone()).toDate());
        const copyrightText = `/*!
  * Taman Admin
  * Version: ${version}
  * Author: Vinicunca
  * Copyright (C) 2024 Taman
  * License: MIT License
  * Description: ${description}
  * Date Created: ${dateCreated}
  * Homepage: ${homepage}
  * Contact: praburangki@gmail.com
*/
              `.trim();

        for (const [, fileContent] of Object.entries(bundle)) {
          if (fileContent.type === 'chunk' && fileContent.isEntry) {
            // Insert copyright information
            const content = fileContent.code;
            const updatedContent = `${copyrightText}${EOL}${content}`;
            // Update bundle
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

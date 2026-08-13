import type { PluginOption } from 'vite';

import type { ArchiverPluginOptions } from '../typing';

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { join } from 'node:path';

import archiver from 'archiver';

export function viteArchiverPlugin(options: ArchiverPluginOptions = {}): PluginOption {
  return {
    apply: 'build',
    closeBundle: {
      handler() {
        const { name = 'dist', outputDir = '.' } = options;

        setTimeout(async () => {
          const folderToZip = 'dist';

          const zipOutputDir = join(process.cwd(), outputDir);
          const zipOutputPath = join(zipOutputDir, `${name}.zip`);
          try {
            await fsp.mkdir(zipOutputDir, { recursive: true });
          } catch {
            // ignore
          }

          try {
            await zipFolder(folderToZip, zipOutputPath);
            console.log(`Folder has been zipped to: ${zipOutputPath}`);
          } catch (error) {
            console.error('Error zipping folder:', error);
          }
        }, 0);
      },
      order: 'post',
    },
    enforce: 'post',
    name: 'vite:archiver',
  };
}

async function zipFolder(
  folderPath: string,
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Max compression level
    });

    output.on('close', () => {
      console.log(
        `ZIP file created: ${outputPath} (${archive.pointer()} total bytes)`,
      );
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Stream directory into archive to reduce memory use
    archive.directory(folderPath, false);

    // Finalize stream
    archive.finalize();
  });
}

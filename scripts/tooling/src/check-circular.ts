import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { parseArgs } from 'node:util';

import { execa, getStagedFiles } from '@taman/node-utils';

const require = createRequire(import.meta.url);
const circularScannerCli
  = require.resolve('circular-dependency-scanner/dist/cli.js');

const DEFAULT_CONFIG = {
  allowedExtensions: ['.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  ignoreDirs: [
    'dist',
    '.nx',
    'output',
    '.cache',
    'scripts',
    'internal',
    'packages/effects/request/src/',
    'packages/@core/ui-kit/menu-ui/src/',
    'packages/@core/ui-kit/popup-ui/src/',
  ],
  threshold: 0,
} as const;

type CircularDependencyResult = Array<string>;

interface CheckCircularConfig {
  allowedExtensions?: Array<string>;
  ignoreDirs?: Array<string>;
  threshold?: number;
}

interface CommandOptions {
  config?: CheckCircularConfig;
  staged: boolean;
  verbose: boolean;
}

const cache = new Map<string, Array<CircularDependencyResult>>();

async function detectCircularDependencies({
  cwd,
  ignorePattern,
  staged,
}: {
  cwd: string;
  ignorePattern: string;
  staged: boolean;
}): Promise<Array<CircularDependencyResult>> {
  const tempDir = await mkdtemp(join(tmpdir(), 'tooling-check-circular-'));
  const outputFile = join(tempDir, 'circles.json');

  try {
    const args = [circularScannerCli, cwd, '--output', outputFile];

    if (staged) {
      args.push('--absolute');
    }

    args.push('--ignore', ignorePattern);

    await execa(process.execPath, args, {
      cwd,
    });

    await access(outputFile);
    const output = await readFile(outputFile, 'utf8');
    return JSON.parse(output) as Array<CircularDependencyResult>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return [];
    }
    throw error;
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

/**
 * @param circles - Circular dependency results
 */
function formatCircles(circles: Array<CircularDependencyResult>): void {
  if (circles.length === 0) {
    console.log('✅ No circular dependencies found');
    return;
  }

  console.log('⚠️ Circular dependencies found:');
  circles.forEach((circle, index) => {
    console.log(`\nCircular dependency #${index + 1}:`);
    circle.forEach((file) => {
      console.log(`  → ${file}`);
    });
  });
}

/**
 * @param options - Check options
 * @param options.staged - Whether to only check staged files
 * @param options.verbose - Whether to show detailed information
 * @param options.config - Custom configuration
 * @returns Promise<void>
 */
async function checkCircular({
  config = {},
  staged,
  verbose,
}: CommandOptions): Promise<void> {
  try {
    const finalConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    const ignorePattern = `**/{${finalConfig.ignoreDirs.join(',')}}/**`;

    const cacheKey = `${staged}-${process.cwd()}-${ignorePattern}`;
    if (cache.has(cacheKey)) {
      const cachedResults = cache.get(cacheKey);
      if (cachedResults && verbose) {
        formatCircles(cachedResults);
      }
      return;
    }

    const results = await detectCircularDependencies({
      cwd: process.cwd(),
      ignorePattern,
      staged,
    });

    if (staged) {
      let files = await getStagedFiles();
      const allowedExtensions = new Set(finalConfig.allowedExtensions);

      files = files.filter((file) => allowedExtensions.has(extname(file)));

      const circularFiles: Array<CircularDependencyResult> = [];

      for (const file of files) {
        for (const result of results) {
          const resultFiles = result.flat();
          if (resultFiles.includes(file)) {
            circularFiles.push(result);
          }
        }
      }

      cache.set(cacheKey, circularFiles);
      if (verbose) {
        formatCircles(circularFiles);
      }
    } else {
      cache.set(cacheKey, results);
      if (verbose) {
        formatCircles(results);
      }
    }

    if (results.length > 0) {
      console.log(
        '\n⚠️ Warning: Circular dependencies found, please check and fix',
      );
    }
  } catch (error) {
    console.error(
      '❌ Error checking circular dependencies:',
      error instanceof Error ? error.message : error,
    );
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      'staged': { type: 'boolean', default: false },
      'verbose': { type: 'boolean' },
      'threshold': { type: 'string', default: '0' },
      'ignore-dirs': { type: 'string' },
    },
  });

  const config: CheckCircularConfig = {
    threshold: Number(values.threshold),
    ...(values['ignore-dirs'] && {
      ignoreDirs: values['ignore-dirs'].split(','),
    }),
  };

  await checkCircular({
    config,
    staged: values.staged ?? false,
    verbose: values.verbose ?? true,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

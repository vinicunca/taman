import { execSync } from 'node:child_process';
import { parseArgs } from 'node:util';

import { execa } from '@taman/node-utils';

interface LintCommandOptions {
  /**
   * Format lint problem.
   */
  format?: boolean;
}

async function runLint({ format }: LintCommandOptions) {
  if (format) {
    await execa('eslint . --cache --fix', {
      stdio: 'inherit',
    });
    return;
  }
  const subprocesses = [
    execa('eslint . --cache', { stdio: 'inherit' }),
  ];

  try {
    await Promise.all(subprocesses);
  } catch (error) {
    for (const subprocess of subprocesses) {
      try {
        if (process.platform === 'win32' && subprocess.pid) {
          execSync(`taskkill /F /T /PID ${subprocess.pid}`, {
            stdio: 'ignore',
          });
        } else {
          subprocess.kill('SIGKILL');
        }
      } catch {
        // process may have already exited
      }
    }
    await Promise.allSettled(subprocesses);
    throw error;
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      format: { type: 'boolean', default: false },
    },
  });

  await runLint({ format: values.format });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

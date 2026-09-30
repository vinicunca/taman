import type { TemplateSource } from './sources';
import type { GenerateNames, TemplateManifest } from './types';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { applyManifest } from './apply';
import { addEnvFiles } from './env';
import { readFileMap, writeFileMap } from './file-map';
import { renderReadme } from './readme';
import { fetchFromGithub, fetchFromLocal } from './sources';

export interface GenerateOptions {
  dir: string;
  names: GenerateNames;
  source: TemplateSource;
  git: boolean;
}

export interface GenerateResult {
  warnings: Array<string>;
}

function hasGitIdentity(dir: string): boolean {
  try {
    return execFileSync('git', ['config', 'user.email'], { cwd: dir, encoding: 'utf8' }).trim() !== '';
  } catch {
    return false;
  }
}

function gitCommit(dir: string): void {
  execFileSync('git', ['init', '-q'], { cwd: dir });
  const identity = hasGitIdentity(dir)
    ? []
    : ['-c', 'user.name=create-taman', '-c', 'user.email=create-taman@users.noreply.github.com'];
  execFileSync('git', ['add', '-A'], { cwd: dir });
  execFileSync('git', [...identity, 'commit', '-q', '--no-verify', '-m', 'Initial commit from create-taman'], { cwd: dir });
}

/**
 * Fetches the template, applies its manifest and writes the project to
 * `dir`. Refuses a non-empty folder; removes a folder it created if anything
 * fails before the project is complete.
 */
export async function generateProject({ dir, git, names, source }: GenerateOptions): Promise<GenerateResult> {
  if (existsSync(dir) && readdirSync(dir).length > 0) {
    throw new Error(`${dir} is not empty`);
  }

  const createdDir = !existsSync(dir);
  const staging = mkdtempSync(join(tmpdir(), 'create-taman-'));

  try {
    if (source.type === 'github') {
      await fetchFromGithub(source.ref, staging);
    } else {
      fetchFromLocal(source.repo, staging);
    }

    const manifestPath = join(staging, 'template.manifest.ts');
    if (!existsSync(manifestPath)) {
      throw new Error('The template has no template.manifest.ts; is the ref older than create-taman?');
    }
    const manifest = (await import(pathToFileURL(manifestPath).href)).default as TemplateManifest;

    const result = applyManifest(readFileMap(staging), manifest, names);
    if (result.errors.length > 0) {
      throw new Error(`The template manifest is out of date:\n- ${result.errors.join('\n- ')}`);
    }

    const files = addEnvFiles(result.files);
    files.set('README.md', renderReadme(names));

    mkdirSync(dir, { recursive: true });
    writeFileMap(dir, files, staging);

    // The project is complete from here on; git is a convenience, so a
    // failure (no git, signing prompt declined, …) must not discard it.
    const warnings = [...result.warnings];
    if (git) {
      try {
        gitCommit(dir);
      } catch (error) {
        const reason = (error instanceof Error ? error.message : String(error)).split('\n')[0];
        warnings.push(`git: the project is ready, but git init/commit failed (${reason}); run it yourself`);
      }
    }

    return { warnings };
  } catch (error) {
    if (createdDir) {
      rmSync(dir, { force: true, recursive: true });
    }
    throw error;
  } finally {
    rmSync(staging, { force: true, recursive: true });
  }
}

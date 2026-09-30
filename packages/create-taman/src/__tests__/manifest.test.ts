// @vitest-environment node
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { applyManifest } from '../apply';
import { readFileMap } from '../file-map';
import { toNames } from '../names';
import { fetchFromLocal } from '../sources';

const repoRoot = resolve(import.meta.dirname, '../../../..');

describe('template.manifest.ts', () => {
  it('applies cleanly to this repository and leaves no template leftovers', async () => {
    const staging = mkdtempSync(join(tmpdir(), 'ct-manifest-'));
    fetchFromLocal(repoRoot, staging);
    const manifest = (await import(pathToFileURL(join(staging, 'template.manifest.ts')).href)).default;

    const { errors, files, warnings } = applyManifest(readFileMap(staging), manifest, toNames('acme-app', 'acme'));

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);

    const paths = [...files.keys()];
    expect(paths.filter((path) => /(?:^|\/)(?:internal|docs|\.github|\.changeset|graphify-out)\//.test(path))).toEqual([]);
    expect(paths.filter((path) => path.includes('views/examples'))).toEqual([]);
    expect(paths.filter((path) => /^packages\/(?:taman-core|taman-ui|request|create-taman)\//.test(path))).toEqual([]);
    expect(paths).toContain('apps/web/src/views/todo/crud.vue');

    const text = [...files].filter(([, contents]) => typeof contents === 'string') as Array<[string, string]>;
    expect(text.filter(([, contents]) => /talent|ticket|ngibur/i.test(contents)).map(([path]) => path)).toEqual([]);
    expect(JSON.parse(files.get('package.json') as string).name).toBe('acme-app');
    expect(files.get('apps/api/nitro.config.ts')).toContain('name: \'acme-app-api\'');
    expect(files.get('docker-compose.yml')).toContain('POSTGRES_DB: acme_app');
    // Cloudflare queues have one consumer worker: a generated project must not share taman's
    expect(files.get('apps/api/nitro.config.ts')).toContain('queue: \'acme-app-email\'');
    expect(files.get('apps/api/nitro.config.ts')).toContain('dead_letter_queue: \'acme-app-email-dlq\'');
    expect(files.get('apps/api/nitro.config.ts')).not.toContain('taman-email');
    expect(files.get('apps/api/server/email/email.queue-consumer.ts')).toContain('EMAIL_QUEUE_NAME = \'acme-app-email\'');
    expect(files.get('apps/api/.env.example')).toContain('NITRO_EMAIL_FROM_NAME=acme-app');
    expect(files.get('pnpm-workspace.yaml')).toContain('\'@vinicunca/taman-core\': ^');
  });
});

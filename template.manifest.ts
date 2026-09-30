import type { TemplateManifest } from './packages/create-taman/src/types.ts';

/**
 * What `create-taman` turns this repository into. The CLI reads this file
 * from the downloaded snapshot, so it always matches the code it describes.
 * No runtime imports: Node strips the types and runs it as-is.
 */
export default {
  remove: [
    // Published packages: generated projects install these from npm
    'packages/taman-core/**',
    'packages/taman-ui/**',
    'packages/request/**',
    'packages/create-taman/**',
    'internal/**',
    // Only meaningful in this repository
    '.github/**',
    '.changeset/**',
    'scripts/release/**',
    'scripts/deploy/**',
    'docs/**',
    'tasks/**',
    '**/graphify-out/**',
    'CLAUDE.md',
    'AGENTS.md',
    '.codex/**',
    '.cursor/**',
    '.gitpod.yml',
    'template.manifest.ts',
    'pnpm-lock.yaml',
    // Example gallery; the todo feature stays as the reference
    'apps/web/src/views/examples/**',
    'apps/web/src/router/routes/modules/dev/examples.ts',
    'apps/web/src/locales/langs/*/examples.json',
  ],
  workspacePackages: ['internal/*', 'internal/lint-configs/*'],
  scripts: ['build:docker', 'check:api-packages', 'publint'],
  scopeFrom: '@taman/',
  rename: [
    { file: 'package.json', from: '"name": "@taman/monorepo"', to: '"name": "{{name}}"' },
    // Kept as-is in this repo: renaming it creates a new Cloudflare worker
    { file: 'apps/api/nitro.config.ts', from: 'name: \'taman-better-auth-back\'', to: 'name: \'{{name}}-api\'' },
    // Cloudflare queues allow one consumer worker; each project needs its own
    { file: 'apps/api/nitro.config.ts', from: '\'taman-email-dlq\'', to: '\'{{name}}-email-dlq\'' },
    { file: 'apps/api/nitro.config.ts', from: '\'taman-email\'', to: '\'{{name}}-email\'' },
    { file: 'apps/api/server/email/email.queue-consumer.ts', from: 'EMAIL_QUEUE_NAME = \'taman-email\'', to: 'EMAIL_QUEUE_NAME = \'{{name}}-email\'' },
    { file: 'docker-compose.yml', from: 'container_name: taman-postgres', to: 'container_name: {{name}}-postgres' },
    { file: 'docker-compose.yml', from: 'taman_data', to: '{{nameSnake}}_data' },
    { file: 'docker-compose.yml', from: 'taman_db', to: '{{nameSnake}}' },
    { file: 'apps/web/.env.example', from: 'VITE_APP_TITLE=Taman', to: 'VITE_APP_TITLE={{name}}' },
    { file: 'apps/web/.env.example', from: 'VITE_APP_NAMESPACE=taman', to: 'VITE_APP_NAMESPACE={{name}}' },
    { file: 'apps/api/.env.example', from: 'taman_db', to: '{{nameSnake}}' },
    { file: 'apps/api/.env.example', from: 'NITRO_EMAIL_FROM_NAME=Taman', to: 'NITRO_EMAIL_FROM_NAME={{name}}' },
    { file: 'packages/server/db-pg/.env.example', from: 'taman_db', to: '{{nameSnake}}' },
  ],
} satisfies TemplateManifest;

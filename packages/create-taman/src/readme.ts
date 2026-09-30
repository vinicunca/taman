import type { GenerateNames } from './types';

export function renderReadme({ name, scope }: GenerateNames): string {
  return `# ${name}

Generated with [create-taman](https://github.com/vinicunca/taman). The code is
yours: change anything. Only the \`@vinicunca/*\` packages receive updates, via
\`pnpm update\`.

## Getting started

\`\`\`bash
docker compose up -d     # Postgres on localhost:5437
pnpm db-pg:migrate:dev   # create the tables
pnpm dev:api             # API on http://localhost:8788
pnpm dev:web             # app on http://localhost:5556
\`\`\`

Each app has a \`.env\` copied from its \`.env.example\`; review them before
deploying.

## Layout

- \`apps/web\`: Vue admin app. \`apps/api\`: Nitro API (Cloudflare Workers).
- \`packages/shell\`: browser-only packages (\`@${scope}/layouts\`, \`@${scope}/app-ui\`, ...).
- \`packages/server\`: database (\`@${scope}/db-pg\`) and emails.
- \`packages/shared\`: code used by both apps (\`@${scope}/api-contract\`, \`@${scope}/rbac\`).

## Adding a feature

Copy the todo feature, one layer at a time: permissions in
\`packages/shared/rbac\`, schema in \`packages/server/db-pg\`, contract in
\`packages/shared/api-contract\`, procedures in \`apps/api/server/domains/todo\`,
pages in \`apps/web/src/views/todo\` with the route in
\`apps/web/src/router/routes/modules/todo.ts\`.
`;
}

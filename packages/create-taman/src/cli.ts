import { execFileSync } from 'node:child_process';
import { basename, relative, resolve } from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';
import * as prompts from '@clack/prompts';
import packageJson from '../package.json';
import { generateProject } from './generate';
import { normalizeScope, toNames, validateName } from './names';

const HELP = `Usage: create-taman <folder> [options]

  --scope <name>   npm scope for workspace packages (default: folder name)
  --ref <ref>      git ref of vinicunca/taman to generate from
                   (default: this CLI's release tag)
  --no-install     skip pnpm install
  --no-git         skip git init and the first commit
  -y, --yes        accept defaults without prompting
  -h, --help       show this help
`;

export interface CliArgs {
  dir?: string;
  scope?: string;
  ref?: string;
  from?: string;
  yes: boolean;
  install: boolean;
  git: boolean;
  help: boolean;
}

export function parseCliArgs(argv: Array<string>): CliArgs {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    args: argv,
    options: {
      'from': { type: 'string' },
      'help': { default: false, short: 'h', type: 'boolean' },
      'no-git': { default: false, type: 'boolean' },
      'no-install': { default: false, type: 'boolean' },
      'ref': { type: 'string' },
      'scope': { type: 'string' },
      'yes': { default: false, short: 'y', type: 'boolean' },
    },
  });

  return {
    dir: positionals[0],
    from: values.from,
    git: !values['no-git'],
    help: values.help,
    install: !values['no-install'],
    ref: values.ref,
    scope: values.scope,
    yes: values.yes,
  };
}

/** The template ref matching this CLI release, so output is what was tested. */
export function defaultRef(): string {
  return `create-taman@${packageJson.version}`;
}

function exit(message: string): never {
  prompts.cancel(message);
  process.exit(1);
}

async function ask(message: string, initialValue: string | undefined, validate: (value: string) => string | undefined): Promise<string> {
  const answer = await prompts.text({ initialValue, message, validate: (value) => validate(value ?? '') });
  if (prompts.isCancel(answer)) {
    exit('Cancelled');
  }
  return answer;
}

export async function main(argv: Array<string> = process.argv.slice(2)): Promise<void> {
  const args = parseCliArgs(argv);
  if (args.help) {
    console.log(HELP);
    return;
  }

  prompts.intro('create-taman');

  const folder = args.dir
    ?? (args.yes
      ? exit('Pass a project folder, e.g. `create-taman my-app`')
      : await ask('Project folder', 'my-app', (value) => validateName(basename(value), 'Project name')));
  const dir = resolve(folder);
  const name = basename(dir);
  const nameError = validateName(name, 'Project name');
  if (nameError) {
    exit(nameError);
  }

  const scope = normalizeScope(
    args.scope ?? (args.yes ? name : await ask('npm scope for workspace packages', name, (value) => validateName(normalizeScope(value), 'Scope'))),
  );
  const scopeError = validateName(scope, 'Scope');
  if (scopeError) {
    exit(scopeError);
  }

  const source = args.from
    ? { repo: resolve(args.from), type: 'local' as const }
    : { ref: args.ref ?? defaultRef(), type: 'github' as const };

  const spinner = prompts.spinner();
  spinner.start(source.type === 'github' ? `Downloading taman (${source.ref})` : `Copying ${source.repo}`);
  try {
    const { warnings } = await generateProject({ dir, git: args.git, names: toNames(name, scope), source });
    spinner.stop(`Created ${name}`);
    for (const warning of warnings) {
      prompts.log.warn(warning);
    }
  } catch (error) {
    spinner.stop('Generation failed');
    exit(error instanceof Error ? error.message : String(error));
  }

  const where = relative(process.cwd(), dir) || '.';
  if (args.install) {
    try {
      execFileSync('pnpm', ['install'], { cwd: dir, stdio: 'inherit' });
    } catch {
      prompts.log.error(`pnpm install failed. The project is ready; run \`pnpm install\` in ${where} again.`);
    }
  }

  prompts.outro(`Next steps:
  cd ${where}
  docker compose up -d
  pnpm db-pg:migrate:dev
  pnpm dev:api   # and in another terminal: pnpm dev:web`);
}

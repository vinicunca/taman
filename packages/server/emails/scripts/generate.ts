import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createTemplateModule } from './generate.lib.ts';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'src/generated');
const files = await readdir(resolve(root, '.maizzle'));
const names = [...new Set(files.filter((file) => file.endsWith('.html')).map((file) => file.slice(0, -5)))];
for (const name of names) {
  const [html, text] = await Promise.all([
    readFile(resolve(root, '.maizzle', `${name}.html`), 'utf8'),
    readFile(resolve(root, '.maizzle', `${name}.txt`), 'utf8'),
  ]);
  await writeFile(resolve(output, `${name}.ts`), createTemplateModule(name, html, text));
}

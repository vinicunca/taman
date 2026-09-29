import { EmailJobError } from './errors.ts';

export const SLOT_TOKEN = /\{\{\s*([a-z][A-Za-z0-9]*)\s*\}\}/g;

export function extractSlots(source: string): string[] {
  return [...new Set([...source.matchAll(SLOT_TOKEN)].map((match) => match[1]!))].sort();
}

export function fillSlots(source: string, values: Readonly<Record<string, string>>): string {
  return source.replace(SLOT_TOKEN, (_token, name: string) => {
    if (!Object.hasOwn(values, name) || typeof values[name] !== 'string') {
      throw new EmailJobError(`Missing template slot: ${name}`);
    }

    return values[name]!;
  });
}

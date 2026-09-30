import type { CompiledTemplate, RenderedEmail } from './types.ts';
import { EmailJobError } from './errors.ts';
import { fillSlots } from './slots.ts';

export interface RenderCompiledInput {
  compiled: CompiledTemplate;
  copy: Readonly<Record<string, string>>;
  vars: object;
  urls: Readonly<Record<string, unknown>>;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[char]!);
}

export function formatCopy(message: string, variables: object, encode?: (value: string) => string): string {
  const vars = variables as Readonly<Record<string, unknown>>;
  const pattern = /\{([a-z][A-Za-z0-9]*)\}/g;
  let output = '';
  let cursor = 0;
  for (const match of message.matchAll(pattern)) {
    const token = match[0];
    const name = match[1]!;
    const value = vars[name];
    if (!Object.hasOwn(vars, name) || typeof value !== 'string') {
      throw new EmailJobError(`Missing email parameter: ${name}`);
    }
    const literal = message.slice(cursor, match.index);
    output += encode ? encode(literal) + encode(value) : literal + value;
    cursor = match.index + token.length;
  }
  const tail = message.slice(cursor);
  return output + (encode ? encode(tail) : tail);
}

export function assertHttpUrl(value: unknown, slot: string): string {
  if (typeof value !== 'string') {
    throw new EmailJobError(`Missing URL for email slot: ${slot}`);
  }
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.href;
    }
  } catch {}

  throw new EmailJobError(`Unsafe URL for email slot: ${slot}`);
}

export function renderCompiled(input: RenderCompiledInput): RenderedEmail {
  const { subject, ...copy } = input.copy;
  if (typeof subject !== 'string') {
    throw new EmailJobError('Email copy is missing subject');
  }
  const expectedCopySlots = input.compiled.slots.filter((slot) => !Object.hasOwn(input.urls, slot)).sort();
  const providedCopySlots = Object.keys(copy).sort();
  if (expectedCopySlots.length !== providedCopySlots.length || expectedCopySlots.some((slot, index) => slot !== providedCopySlots[index])) {
    throw new EmailJobError('Email copy keys do not match compiled template slots');
  }
  const htmlValues: Record<string, string> = {};
  const textValues: Record<string, string> = {};
  for (const slot of input.compiled.slots) {
    if (Object.hasOwn(input.urls, slot)) {
      const url = assertHttpUrl(input.urls[slot], slot);
      htmlValues[slot] = escapeHtml(url);
      textValues[slot] = url;
    } else {
      const message = copy[slot];
      if (typeof message !== 'string') {
        throw new EmailJobError(`Missing email copy slot: ${slot}`);
      }
      htmlValues[slot] = formatCopy(message, input.vars, escapeHtml);
      textValues[slot] = formatCopy(message, input.vars);
    }
  }

  return {
    subject: formatCopy(subject, input.vars).replace(/\s*[\r\n]\s*/g, ' ').trim(),
    html: fillSlots(input.compiled.html, htmlValues),
    text: fillSlots(input.compiled.text, textValues),
  };
}

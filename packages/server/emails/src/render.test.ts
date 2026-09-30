// @vitest-environment node
// cspell:ignore preheader
import type { CompiledTemplate } from './types.ts';
import { describe, expect, it } from 'vitest';
import { EmailJobError } from './errors.ts';
import { assertHttpUrl, escapeHtml, formatCopy, renderCompiled } from './render.ts';

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml('<a href="x">Tom & \'Jerry\'</a>'))
      .toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;');
  });
});

describe('formatCopy', () => {
  it('replaces {param} tokens', () => {
    expect(formatCopy('Hi {name}!', { name: 'Ana' })).toBe('Hi Ana!');
  });

  it('runs the encoder over literal copy and values', () => {
    expect(formatCopy('Tom & {name}', { name: '<b>' }, escapeHtml)).toBe('Tom &amp; &lt;b&gt;');
  });

  it('does not expand tokens that appear inside values', () => {
    expect(formatCopy('{a} {b}', { a: '{b}', b: 'x' })).toBe('{b} x');
  });

  it('keeps $ sequences in values literally', () => {
    expect(formatCopy('Org: {name}', { name: '$& $1 $$' })).toBe('Org: $& $1 $$');
  });

  it('throws EmailJobError for a missing, prototype or non-string value', () => {
    expect(() => formatCopy('Hi {name}', {})).toThrow(EmailJobError);
    expect(() => formatCopy('Hi {toString}', {})).toThrow(EmailJobError);
    expect(() => formatCopy('Hi {name}', { name: 42 as unknown as string })).toThrow(EmailJobError);
  });
});

describe('assertHttpUrl', () => {
  it('accepts absolute http(s) URLs', () => {
    expect(assertHttpUrl('https://app.test/x?a=1&b=2', 'actionUrl')).toBe('https://app.test/x?a=1&b=2');
    expect(assertHttpUrl('http://localhost:5601/auth', 'actionUrl')).toBe('http://localhost:5601/auth');
  });

  it.each(['javascript:alert(1)', '/relative/path', 'mailto:a@b.test', undefined, ''])('rejects %s', (value) => {
    expect(() => assertHttpUrl(value, 'actionUrl')).toThrow(EmailJobError);
  });
});

describe('renderCompiled', () => {
  const compiled: CompiledTemplate = {
    slots: ['actionUrl', 'heading', 'preheader'],
    html: '<p>{{preheader}}</p><h1>{{heading}}</h1><a href="{{actionUrl}}">{{actionUrl}}</a>',
    text: '{{heading}}\n{{actionUrl}}',
  };
  const copy = { subject: 'Join {org}', preheader: 'Hi', heading: 'Join {org}' };

  it('fills html with escaped copy and text with plain copy', () => {
    const email = renderCompiled({
      compiled,
      copy,
      vars: { org: 'A&B <Corp>' },
      urls: { actionUrl: 'https://app.test/x?a=1&b=2' },
    });

    expect(email.subject).toBe('Join A&B <Corp>');
    expect(email.html).toBe('<p>Hi</p><h1>Join A&amp;B &lt;Corp&gt;</h1><a href="https://app.test/x?a=1&amp;b=2">https://app.test/x?a=1&amp;b=2</a>');
    expect(email.text).toBe('Join A&B <Corp>\nhttps://app.test/x?a=1&b=2');
  });

  it('flattens line breaks in the subject', () => {
    const email = renderCompiled({
      compiled,
      copy,
      vars: { org: 'Evil\r\nBcc: victim@x.test' },
      urls: { actionUrl: 'https://app.test' },
    });

    expect(email.subject).toBe('Join Evil Bcc: victim@x.test');
  });

  it('rejects a non-http URL slot', () => {
    expect(() => renderCompiled({ compiled, copy, vars: { org: 'A' }, urls: { actionUrl: 'javascript:alert(1)' } }))
      .toThrow(EmailJobError);
  });

  it('throws when the copy has no subject', () => {
    expect(() => renderCompiled({ compiled, copy: { preheader: 'Hi', heading: 'H' }, vars: {}, urls: { actionUrl: 'https://app.test' } }))
      .toThrow(EmailJobError);
  });

  it('throws when a slot has neither copy nor URL', () => {
    expect(() => renderCompiled({ compiled, copy: { subject: 'S', preheader: 'Hi' }, vars: {}, urls: { actionUrl: 'https://app.test' } }))
      .toThrow(EmailJobError);
  });
});

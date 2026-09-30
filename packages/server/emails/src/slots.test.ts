// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { EmailJobError } from './errors.ts';
import { extractSlots, fillSlots } from './slots.ts';

describe('extractSlots', () => {
  it('returns unique slot names, sorted, allowing inner whitespace', () => {
    expect(extractSlots('<a href="{{actionUrl}}">{{ heading }}</a>{{heading}}')).toEqual(['actionUrl', 'heading']);
  });

  it('ignores single-brace copy params', () => {
    expect(extractSlots('Hi {name}')).toEqual([]);
  });
});

describe('fillSlots', () => {
  it('replaces every slot', () => {
    expect(fillSlots('<h1>{{ heading }}</h1><p>{{intro}}</p>', { heading: 'Hi', intro: 'There' })).toBe('<h1>Hi</h1><p>There</p>');
  });

  it('never re-scans inserted values for more slots', () => {
    expect(fillSlots('{{a}}|{{b}}', { a: '{{b}}', b: 'x' })).toBe('{{b}}|x');
  });

  it('inserts $ sequences literally', () => {
    expect(fillSlots('{{a}}', { a: '$& $1 $$' })).toBe('$& $1 $$');
  });

  it('throws EmailJobError for a slot without a value, including prototype keys', () => {
    expect(() => fillSlots('{{missing}}', {})).toThrow(EmailJobError);
    expect(() => fillSlots('{{constructor}}', {})).toThrow(EmailJobError);
  });
});

// packages/db/src/codes.test.ts
import { describe, expect, it } from 'vitest';
import { generateTicketCode, normalizeTicketCode, TICKET_CODE_ALPHABET, TICKET_CODE_LENGTH } from './codes.ts';

describe('generateTicketCode', () => {
  it('returns a code of the configured length using only the alphabet', () => {
    for (let i = 0; i < 500; i++) {
      const code = generateTicketCode();
      expect(code).toHaveLength(TICKET_CODE_LENGTH);
      expect(code).toMatch(new RegExp(`^[${TICKET_CODE_ALPHABET}]+$`));
      expect(code).toBe(code.toUpperCase());
    }
  });

  it('excludes the ambiguous characters I, L, O, U', () => {
    expect(TICKET_CODE_ALPHABET).not.toMatch(/[ILOU]/);
    const joined = Array.from({ length: 200 }, () => generateTicketCode()).join('');
    expect(joined).not.toMatch(/[ILOU]/);
  });

  it('produces varied codes (not a constant)', () => {
    const set = new Set(Array.from({ length: 100 }, () => generateTicketCode()));
    expect(set.size).toBeGreaterThan(90);
  });
});

describe('normalizeTicketCode', () => {
  it('uppercases and strips non-alphanumerics', () => {
    expect(normalizeTicketCode('r7k2-9qx4')).toBe('R7K29QX4');
    expect(normalizeTicketCode(' R7K2 9QX4 ')).toBe('R7K29QX4');
    expect(normalizeTicketCode('r7k2_9qx4')).toBe('R7K29QX4');
  });

  it('returns empty string for input with no alphanumerics', () => {
    expect(normalizeTicketCode('---')).toBe('');
  });
});

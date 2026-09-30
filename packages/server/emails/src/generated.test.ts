// @vitest-environment node
// cspell:ignore preheader
import { describe, expect, it } from 'vitest';
import invitationCompiled from './generated/invitation.ts';
import resetPasswordCompiled from './generated/reset-password.ts';
import verifyEmailCompiled from './generated/verify-email.ts';

const ACTION_SLOTS = ['actionLabel', 'actionUrl', 'heading', 'ignore', 'intro', 'linkHint', 'preheader'];

describe('generated templates', () => {
  it.each([
    ['invitation', invitationCompiled, [...ACTION_SLOTS, 'expiry'].sort()],
    ['verify-email', verifyEmailCompiled, ACTION_SLOTS],
    ['reset-password', resetPasswordCompiled, ACTION_SLOTS],
  ] as const)('%s exposes exactly the contract slots', (_name, compiled, slots) => {
    expect(compiled.slots).toEqual(slots);
  });

  it.each([
    ['invitation', invitationCompiled],
    ['verify-email', verifyEmailCompiled],
    ['reset-password', resetPasswordCompiled],
  ] as const)('%s keeps the button link and a visible link in html and text', (_name, compiled) => {
    expect(compiled.html).toMatch(/<html[\s>]/i);
    expect(compiled.html).toContain('href="{{actionUrl}}"');
    expect(compiled.text).toMatch(/\{\{\s*actionUrl\s*\}\}/);
    expect(compiled.text).toMatch(/\{\{\s*heading\s*\}\}/);
  });
});

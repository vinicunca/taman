import { describe, expect, it } from 'vitest';
import { TalentCreateSchema, TalentUpdateSchema } from './talent';

describe('talent write contract', () => {
  it('accepts a valid status on create', () => {
    const parsed = TalentCreateSchema.parse({
      legalName: 'A',
      stageName: 'B',
      status: 'published',
    });

    expect(parsed.status).toBe('published');
  });

  it('rejects an unknown status', () => {
    const result = TalentCreateSchema.safeParse({
      legalName: 'A',
      stageName: 'B',
      status: 'live',
    });

    expect(result.success).toBe(false);
  });

  it('leaves status absent when omitted on update', () => {
    const parsed = TalentUpdateSchema.parse({ bio: 'new' });

    expect(parsed).not.toHaveProperty('status');
  });

  it('carries status through an update when sent', () => {
    const parsed = TalentUpdateSchema.parse({ status: 'draft' });

    expect(parsed.status).toBe('draft');
  });
});

import { describe, expect, it } from 'vitest';
import { talentInsertSchema } from './validation.talent';

const VALID = { legalName: 'Legal', stageName: 'Stage' };

describe('talentInsertSchema', () => {
  it('strips a client-supplied id', () => {
    const parsed = talentInsertSchema.parse({
      ...VALID,
      id: '018f2d1e-0000-7000-8000-000000000000',
    });

    expect(parsed).not.toHaveProperty('id');
  });

  it('strips client-supplied timestamps', () => {
    const parsed = talentInsertSchema.parse({
      ...VALID,
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date('2020-01-01'),
    });

    expect(parsed).not.toHaveProperty('createdAt');
    expect(parsed).not.toHaveProperty('updatedAt');
  });

  it('strips organizationId, which is injected from the caller membership', () => {
    const parsed = talentInsertSchema.parse({
      ...VALID,
      organizationId: '018f2d1e-0000-7000-8000-000000000001',
    });

    expect(parsed).not.toHaveProperty('organizationId');
  });

  it('rejects an unknown status', () => {
    const result = talentInsertSchema.safeParse({ ...VALID, status: 'live' });

    expect(result.success).toBe(false);
  });

  it('accepts a valid status', () => {
    const parsed = talentInsertSchema.parse({ ...VALID, status: 'published' });

    expect(parsed.status).toBe('published');
  });

  it('leaves status absent when omitted', () => {
    const parsed = talentInsertSchema.parse(VALID);

    expect(parsed).not.toHaveProperty('status');
  });
});

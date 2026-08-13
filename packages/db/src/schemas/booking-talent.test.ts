import { describe, expect, it } from 'vitest';
import { BookingTalentCreateSchema, BookingTalentUpdateSchema } from './booking-talent';

const TALENT_ID = '018f2d1e-0000-7000-8000-000000000020';
const VALID = { talentId: TALENT_ID, role: 'mc', performedAt: '2026-08-06T10:00:00Z' };

describe('bookingTalentCreateSchema', () => {
  it('accepts a valid booking', () => {
    const parsed = BookingTalentCreateSchema.parse(VALID);

    expect(parsed.talentId).toBe(TALENT_ID);
    expect(parsed.performedAt).toBeInstanceOf(Date);
  });

  it('strips organizationId, which is injected from the caller membership', () => {
    const parsed = BookingTalentCreateSchema.parse({
      ...VALID,
      organizationId: '018f2d1e-0000-7000-8000-000000000021',
    });

    expect(parsed).not.toHaveProperty('organizationId');
  });

  it('rejects a missing talentId', () => {
    const result = BookingTalentCreateSchema.safeParse({
      role: 'mc',
      performedAt: '2026-08-06T10:00:00Z',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an unknown role', () => {
    const result = BookingTalentCreateSchema.safeParse({ ...VALID, role: 'headliner' });

    expect(result.success).toBe(false);
  });

  it('accepts an optional clientName and location', () => {
    const parsed = BookingTalentCreateSchema.parse({
      ...VALID,
      clientName: 'Bank X',
      location: 'Client HQ, Jakarta',
    });

    expect(parsed.clientName).toBe('Bank X');
  });
});

describe('bookingTalentUpdateSchema', () => {
  it('allows a partial payload', () => {
    const parsed = BookingTalentUpdateSchema.parse({ note: 'paid in full' });

    expect(parsed).toEqual({ note: 'paid in full' });
  });

  it('strips talentId, which is not reassignable via update', () => {
    const parsed = BookingTalentUpdateSchema.parse({
      talentId: TALENT_ID,
      note: 'x',
    });

    expect(parsed).not.toHaveProperty('talentId');
  });
});

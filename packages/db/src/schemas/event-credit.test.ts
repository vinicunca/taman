import { describe, expect, it } from 'vitest';
import { EventCreditCreateSchema } from './event-credit';

const EVENT_ID = '018f2d1e-0000-7000-8000-000000000010';
const TALENT_ID = '018f2d1e-0000-7000-8000-000000000011';
const USER_ID = '018f2d1e-0000-7000-8000-000000000012';

describe('eventCreditCreateSchema', () => {
  it('accepts a talent-only credit', () => {
    const parsed = EventCreditCreateSchema.parse({
      eventId: EVENT_ID,
      talentId: TALENT_ID,
      role: 'performer',
    });

    expect(parsed.talentId).toBe(TALENT_ID);
  });

  it('accepts a user-only credit', () => {
    const parsed = EventCreditCreateSchema.parse({
      eventId: EVENT_ID,
      userId: USER_ID,
      role: 'check_in',
    });

    expect(parsed.userId).toBe(USER_ID);
  });

  it('accepts a guest-only credit', () => {
    const parsed = EventCreditCreateSchema.parse({
      eventId: EVENT_ID,
      guestName: 'Touring Comic',
      role: 'mc',
    });

    expect(parsed.guestName).toBe('Touring Comic');
  });

  it('rejects a credit with no subject', () => {
    const result = EventCreditCreateSchema.safeParse({
      eventId: EVENT_ID,
      role: 'performer',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a credit with two subjects set', () => {
    const result = EventCreditCreateSchema.safeParse({
      eventId: EVENT_ID,
      talentId: TALENT_ID,
      userId: USER_ID,
      role: 'performer',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an unknown role', () => {
    const result = EventCreditCreateSchema.safeParse({
      eventId: EVENT_ID,
      talentId: TALENT_ID,
      role: 'headliner',
    });

    expect(result.success).toBe(false);
  });
});

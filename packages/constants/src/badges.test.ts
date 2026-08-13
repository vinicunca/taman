import { describe, expect, it } from 'vitest';
import { evaluateBadges } from './badges';

describe('evaluateBadges', () => {
  it('returns no badges for zero credits', () => {
    expect(evaluateBadges([])).toEqual([]);
  });

  it('awards a one-off badge on a single appearance', () => {
    expect(evaluateBadges([{ type: 'competition', count: 1 }])).toContain('competitor');
  });

  it('does not award a threshold badge below its minimum', () => {
    expect(evaluateBadges([{ type: 'open_mic', count: 9 }])).not.toContain('open_mic_vet');
  });

  it('awards a threshold badge at its minimum', () => {
    expect(evaluateBadges([{ type: 'open_mic', count: 10 }])).toContain('open_mic_vet');
  });

  it('awards multiple badges at once', () => {
    const badges = evaluateBadges([
      { type: 'competition', count: 2 },
      { type: 'festival', count: 1 },
    ]);

    expect(badges).toEqual(expect.arrayContaining(['competitor', 'festival_act']));
  });

  it('ignores an event type with no badge rule', () => {
    expect(evaluateBadges([{ type: 'showcase', count: 100 }])).toEqual([]);
  });
});

import type { EventType } from './ticketing';

export interface TalentBadgeRule {
  type: EventType;
  min: number;
}

export interface TalentBadgeDefinition {
  id: string;
  label: string;
  emoji: string;
  rule: TalentBadgeRule;
}

export const TALENT_BADGES = [
  { id: 'competitor', label: 'Competitor', emoji: '🏆', rule: { type: 'competition', min: 1 } },
  { id: 'main_event', label: 'Main Event', emoji: '⭐', rule: { type: 'special_show', min: 1 } },
  { id: 'festival_act', label: 'Festival Act', emoji: '🎪', rule: { type: 'festival', min: 1 } },
  { id: 'open_mic_vet', label: 'Open Mic Vet', emoji: '🎤', rule: { type: 'open_mic', min: 10 } },
] as const satisfies ReadonlyArray<TalentBadgeDefinition>;

export type TalentBadgeId = (typeof TALENT_BADGES)[number]['id'];

export interface EventTypeCount {
  type: EventType;
  count: number;
}

/**
 * Pure evaluation over grouped event-type appearance counts. No DB, no
 * service dependency — badges are fully derived and therefore always
 * consistent with the underlying event_credit rows.
 */
export function evaluateBadges(counts: ReadonlyArray<EventTypeCount>): Array<TalentBadgeId> {
  const countByType = new Map(counts.map((c) => [c.type, c.count]));

  return TALENT_BADGES
    .filter((badge) => (countByType.get(badge.rule.type) ?? 0) >= badge.rule.min)
    .map((badge) => badge.id);
}

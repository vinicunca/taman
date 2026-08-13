export const EVENT_STATUSES = ['draft', 'published', 'archived'] as const;
export const TALENT_STATUSES = ['draft', 'published'] as const;
export const ORDER_STATUSES = ['pending', 'paid', 'cancelled', 'expired', 'refunded'] as const;
export const TRANSACTION_STATUSES = ['pending', 'settlement', 'failed', 'cancelled', 'refunded'] as const;
export const GENDERS = ['m', 'f'] as const;
export const ORG_ROLES = ['owner', 'admin', 'member'] as const;
export const EVENT_TYPES = ['open_mic', 'showcase', 'special_show', 'competition', 'festival'] as const;
export const EVENT_PRODUCTION_ROLES = ['own', 'crew', 'co_host'] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];
export type TalentStatus = (typeof TALENT_STATUSES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];
export type Gender = (typeof GENDERS)[number];
export type OrgRole = (typeof ORG_ROLES)[number];
export type EventType = (typeof EVENT_TYPES)[number];
export type EventProductionRole = (typeof EVENT_PRODUCTION_ROLES)[number];

export const EVENT_CREDIT_ROLES = [
  'performer', 'host', 'mc',
  'producer', 'stage_manager', 'sound', 'lighting',
  'ticketing', 'check_in', 'photographer', 'videographer',
] as const;

/** The on-stage subset — shared by crew-reliability (excludes these) and badge counting (includes these), so the two queries can never define "on stage" differently. */
export const STAGE_CREDIT_ROLES = ['performer', 'host', 'mc'] as const;

export type EventCreditRole = (typeof EVENT_CREDIT_ROLES)[number];

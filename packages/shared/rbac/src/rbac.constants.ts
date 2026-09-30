export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type AuthRoleNames = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ORGANIZATION_ROLES = {
  OWNER: 'owner',
  MEMBER: 'member',
} as const;

export type OrganizationRoleNames = (typeof ORGANIZATION_ROLES)[keyof typeof ORGANIZATION_ROLES];

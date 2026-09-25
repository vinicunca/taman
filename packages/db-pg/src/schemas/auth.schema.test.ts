import { describe, expect, it } from 'vitest';
import { sessionTable, teamMemberTable, teamTable } from './auth.schema';

describe('Better Auth Drizzle schema', () => {
  it('includes every field required by organization teams', () => {
    expect(sessionTable.activeTeamId).toBeDefined();

    expect(teamTable.memberCount).toBeDefined();
    expect(teamTable.memberCount.notNull).toBe(true);
    expect(teamTable.memberCount.default).toBeDefined();

    expect(teamMemberTable.membershipKey).toBeDefined();
    expect(teamMemberTable.membershipKey.isUnique).toBe(true);
  });
});

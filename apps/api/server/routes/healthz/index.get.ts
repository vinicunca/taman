import { defineHandler } from 'nitro';

// Liveness: proves the Worker booted and can run code. No dependency checks.
export default defineHandler(() => {
  return { status: 'ok' };
});

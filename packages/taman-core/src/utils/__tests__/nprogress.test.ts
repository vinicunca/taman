import { describe, expect, it, vi } from 'vitest';
import { startProgress, stopProgress } from '../nprogress';

// nprogress is CommonJS: under Node its dynamic-import namespace only has
// `default`, so the helper must unwrap it (Vite's interop hides this in apps).
const nprogress = vi.hoisted(() => ({ configure: vi.fn(), done: vi.fn(), start: vi.fn() }));
vi.mock('nprogress', () => ({ default: nprogress }));

describe('nprogress helpers', () => {
  it('configures and drives the CommonJS default export', async () => {
    await startProgress();
    await stopProgress();

    expect(nprogress.configure).toHaveBeenCalledOnce();
    expect(nprogress.start).toHaveBeenCalledOnce();
    expect(nprogress.done).toHaveBeenCalledOnce();
  });
});

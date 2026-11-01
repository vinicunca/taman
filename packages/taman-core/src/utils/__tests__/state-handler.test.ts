import { describe, expect, it } from 'vitest';

import { StateHandler } from '../state-handler';

describe('stateHandler', () => {
  it('resolves every concurrent waiter', async () => {
    const handler = new StateHandler();
    const waiting = Promise.all([handler.waitForCondition(), handler.waitForCondition()]);
    handler.setConditionTrue();
    await expect(waiting).resolves.toEqual([undefined, undefined]);
  });

  it.each(['setConditionFalse', 'reset'] as const)('rejects every waiter on %s and can be reused', async (transition) => {
    const handler = new StateHandler();
    const waiting = Promise.allSettled([handler.waitForCondition(), handler.waitForCondition()]);
    handler[transition]();
    const results = await waiting;
    expect(results).toEqual([
      { status: 'rejected', reason: expect.any(Error) },
      { status: 'rejected', reason: expect.any(Error) },
    ]);
    const next = handler.waitForCondition();
    handler.setConditionTrue();
    await expect(next).resolves.toBeUndefined();
  });

  it('should resolve when condition is set to true', async () => {
    const handler = new StateHandler();

    // Simulate setting condition to true asynchronously
    setTimeout(() => {
      handler.setConditionTrue(); // Explicitly set condition to true
    }, 10);

    // Wait for condition to become true
    await handler.waitForCondition();
    expect(handler.isConditionTrue()).toBe(true);
  });

  it('should resolve immediately if condition is already true', async () => {
    const handler = new StateHandler();
    handler.setConditionTrue(); // Set to true in advance

    // Resolve immediately because condition is already true
    await handler.waitForCondition();
    expect(handler.isConditionTrue()).toBe(true);
  });

  it('should reject when condition is set to false after waiting', async () => {
    const handler = new StateHandler();

    // Simulate setting condition to false asynchronously
    setTimeout(() => {
      handler.setConditionFalse(); // Explicitly set condition to false
    }, 10);

    // Expect the Promise to be rejected while waiting
    await expect(handler.waitForCondition()).rejects.toThrow(
      'Condition was set to false',
    );
    expect(handler.isConditionTrue()).toBe(false);
  });

  it('should reset condition to false', () => {
    const handler = new StateHandler();
    handler.setConditionTrue(); // Set to true
    handler.reset(); // Reset to false

    expect(handler.isConditionTrue()).toBe(false);
  });

  it('should resolve when condition is set to true after reset', async () => {
    const handler = new StateHandler();
    handler.reset(); // Ensure initial state is false

    setTimeout(() => {
      handler.setConditionTrue(); // Set to true after reset
    }, 10);

    await handler.waitForCondition();
    expect(handler.isConditionTrue()).toBe(true);
  });
});

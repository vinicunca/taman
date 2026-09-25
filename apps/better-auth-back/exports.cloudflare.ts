import { PublisherDurableObject } from '@orpc/experimental-publisher-durable-object';

type PublisherObjectArgs = ConstructorParameters<typeof PublisherDurableObject>;

/**
 * Relays todo events between Worker isolates. Resume keeps five minutes of
 * events so a reconnecting client catches up via `lastEventId`.
 */
export class TodoPublisherObject extends PublisherDurableObject {
  constructor(ctx: PublisherObjectArgs[0], env: PublisherObjectArgs[1]) {
    super(ctx, env, { resume: { retentionSeconds: 300 } });
  }
}

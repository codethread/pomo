import { ActorRef, EventObject } from 'xstate';
import { ConfigActorRef } from './config/machine';
import { MainService } from './main/machine';
import { PomodoroActorRef } from './pomodoro/machine';
import { actorIds, Actors } from './constants';

/**
 *
 * @see https://github.com/davidkpiano/xstate/discussions/1591
 */
export function assertEventType<TE extends EventObject, TType extends TE['type']>(
  event: TE,
  eventType: TType
): asserts event is TE & { type: TType } {
  if (event.type !== eventType) {
    throw new Error(`Invalid event: expected "${eventType}", got "${event.type}"`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function nullActor(overrides?: Partial<ActorRef<any, any>>): ActorRef<any, any> {
  return {
    id: 'null',
    send: () => {},
    subscribe: () => ({ unsubscribe: () => {} }),
    getSnapshot: () => {},
    [Symbol.observable]: () => ({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    ...overrides,
  };
}

/**
 * Get an actor from another actor, not to be used with React's hooks.
 */
export function getActor<K extends keyof typeof actorIds>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: any,
  id: K
): Actors[K] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const actor = service.children.get(id) as Actors[K] | undefined;
  if (!actor) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new ActorError(service, id);
  }
  return actor;
}

type ActorsWithChildren = ConfigActorRef | MainService | PomodoroActorRef;

/**
 * An error which is intended to be used when extracting an actor from another actor.
 * At present, xstate does not type the children of an actor, so we must assert the type, and it's
 * possible that the programmer makes a mistake at this point. This error should only show up in
 * tests or during development, if you see it during runtime, you have a rather large hole in
 * testing!
 */
export class ActorError extends Error {
  constructor(actor: ActorsWithChildren, id: keyof typeof actorIds) {
    const msg = `programmer error, "${id}}" not found in machine. Actor refs found: "${Array.from(
      // little bit of massaging here as we're treating everything as a service, even though the types are actor refs (they are fundamentally the same thing, but have some api differences).
      (actor as MainService).children.keys()
    ).join(',')}"`;

    super(msg);
  }
}

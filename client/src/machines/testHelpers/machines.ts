import { AnyStateMachine, createMachine } from 'xstate';
import { actorIds } from '../constants';

interface Parent<A> {
  parentEvents: string[];
  childMachine: A;
  childId: keyof typeof actorIds;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parentMachine<A extends AnyStateMachine>({
  childMachine,
  parentEvents,
  childId,
}: Parent<A>) {
  return createMachine(
    {
      id: 'parent',
      initial: 'running',
      states: {
        running: {
          on: Object.fromEntries(parentEvents.map((e) => [e, { actions: 'spy' }])),
          invoke: {
            id: childId,
            src: childMachine,
          },
        },
      },
    },
    {
      actions: {
        spy: () => {},
      },
    }
  );
}

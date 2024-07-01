import { AnyStateMachine, createMachine } from 'xstate';
import { actorIds } from '../constants';

interface Parent<A> {
  parentEvents: string[];
  childMachine: A;
  childId: keyof typeof actorIds;
  spy?: (c: any, e: any) => void;
}

export function parentMachine<A extends AnyStateMachine>({
  childMachine,
  parentEvents,
  childId,
  spy = () => {},
}: Parent<A>) {
  return createMachine(
    {
      id: 'parent',
      initial: 'running',
      preserveActionOrder: true,
      predictableActionArguments: true,
      states: {
        running: {
          on: Object.fromEntries(
            parentEvents.map((e) => [e, { actions: 'spy' }]),
          ),
          invoke: {
            id: childId,
            src: childMachine,
          },
        },
      },
    },
    {
      actions: {
        spy,
      },
    },
  );
}

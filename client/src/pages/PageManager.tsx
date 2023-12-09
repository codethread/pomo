import { Header, Slack, Theme, Timer } from '@client/components';
import { useTimerSettings } from '@client/hooks';
import { assertUnreachable } from '@shared/asserts';
import React, { useReducer } from 'react';
import { Navigation } from './Navigation';
import { Pomodoro } from './Pomodoro';

export type Pages = 'Slack Settings' | 'Theme Settings' | 'Timer Settings' | 'Timer';

export interface IPageManager {
  initialPage?: Pages;
}

export function PageManager({ initialPage = 'Timer' }: IPageManager = {}): JSX.Element {
  const [{ page, navVisible }, dispatch] = useReducer(reducer, initialState(initialPage));

  return (
    <div className="flex h-full w-full flex-col overflow-y-scroll bg-thmBackground text-base text-thmFg">
      <h1 style={{ display: 'none' }}>Pomodoro App</h1>
      <Header
        onClick={() => {
          dispatch({ type: 'ToggleNav' });
        }}
        showClose={navVisible}
        page={page}
      />
      {navVisible ? (
        <Navigation
          page={page}
          onNavigate={(p) => {
            dispatch({ type: 'Navigate', page: p });
          }}
        />
      ) : (
        <div className="flex flex-grow flex-col  justify-start justify-items-stretch">
          <Page page={page} />
        </div>
      )}
    </div>
  );
}

function Page({ page }: { page: Pages }): JSX.Element {
  const timerActor = useTimerSettings();

  switch (page) {
    case 'Timer':
      return <Pomodoro />;
    case 'Timer Settings':
      return timerActor ? <Timer actor={timerActor} /> : <p>'loading'</p>;
    case 'Slack Settings':
      return <Slack />;
    case 'Theme Settings':
      return <Theme />;
    default:
      return assertUnreachable(page);
  }
}

interface State {
  page: Pages;
  navVisible: boolean;
}

type Action = { type: 'Navigate'; page: Pages } | { type: 'ToggleNav' };

function reducer(state: State, action: Action): State {
  const { type } = action;
  switch (type) {
    case 'ToggleNav':
      return { ...state, navVisible: !state.navVisible };
    case 'Navigate':
      return { ...state, page: action.page, navVisible: false };
    default:
      return assertUnreachable(type);
  }
}

function initialState(page: Pages): State {
  return {
    navVisible: false,
    page,
  };
}

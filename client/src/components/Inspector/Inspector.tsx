import React, { useLayoutEffect, useState } from 'react';
import { inspect } from '@xstate/inspect';

export interface IInspector {
  toggleable?: boolean;
}

export function Inspector({ toggleable }: IInspector): JSX.Element {
  const [inspecting, setInspecting] = useState(!toggleable);

  // required to run before render cycle so as that listeners are present when machine is mounted
  // mocking this in the test seems overkill, so just don't change this
  useLayoutEffect(() => {
    const i = inspect();

    return () => {
      i?.disconnect();
    };
  }, []);

  return (
    <>
      {toggleable && (
        <button
          type="button"
          onClick={() => {
            setInspecting((x) => !x);
          }}
        >
          {inspecting ? 'hide inspector' : 'show inspector'}
        </button>
      )}
      <iframe
        id="xstate"
        title="xstate"
        data-xstate
        style={{
          display: inspecting ? 'block' : 'none',
          height: '95vh',
          width: '100%',
        }}
      />
    </>
  );
}

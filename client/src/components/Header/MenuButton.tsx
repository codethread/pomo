import { MouseEventHandler } from 'react';
import './menuButton.css';

interface IBar {
  wide?: boolean;
  classNames: string;
}

function Bar({ wide = false, classNames }: IBar): JSX.Element {
  return <div className={`${wide ? 'w-[35px]' : 'w-[26px]'} bar ${classNames}`} />;
}

interface IHamburgerC {
  showClose: boolean;
}

function Hamburger({ showClose }: IHamburgerC): JSX.Element {
  return (
    <div
      aria-hidden
      style={{
        width: '35px',
        height: '16px',
        position: 'relative',
      }}
    >
      <Bar classNames={cls('top', showClose)} />
      <Bar wide classNames={cls('middle', showClose)} />
      <Bar classNames={cls('bottom', showClose)} />
    </div>
  );
}

interface IMenuButton {
  onClick: MouseEventHandler<HTMLButtonElement>;
  showClose: boolean;
}

export function MenuButton({ onClick, showClose }: IMenuButton): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="menu-button p-[10px] outline-1 outline-offset-[-5px] outline-thmPrimary"
    >
      <span className="sr-only">{showClose ? 'timer' : 'settings'}</span>
      <Hamburger showClose={showClose} />
    </button>
  );
}

function cls(classes: string, showClose: boolean): string {
  return showClose ? `${classes} showClose` : classes;
}

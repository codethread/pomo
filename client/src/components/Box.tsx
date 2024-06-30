import { IChildren } from '@shared/types';
import classNames from 'classnames';

interface IBox extends IChildren {
  className?: string;
  style?: React.CSSProperties;
}

export function Box({ children, className, style }: IBox): JSX.Element {
  return (
    <div
      style={style}
      className={classNames(
        'flex flex-col justify-center justify-items-stretch',
        className,
      )}
    >
      {children}
    </div>
  );
}

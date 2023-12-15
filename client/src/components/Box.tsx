import { IChildren } from '@shared/types';

interface IBox extends IChildren {
  className?: string;
  style?: React.CSSProperties;
}

export function Box({ children, className, style }: IBox): JSX.Element {
  return (
    <div
      style={style}
      className={` flex flex-col justify-center justify-items-stretch ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

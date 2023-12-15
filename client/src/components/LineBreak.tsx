import { IChildren } from '@shared/types';

export function LineBreak({ children }: IChildren): JSX.Element {
  return (
    <div className="w-9/10 mx-auto mt-0 mb-2 border-b border-thmBackgroundBright">{children}</div>
  );
}

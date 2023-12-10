import classNames from 'classnames';
import React, { useState } from 'react';

export interface IInputSelect<A>
  extends Omit<
    React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>,
    'onChange'
  > {
  id: string;
  hasError?: boolean;
  readonly initialValue: A | 'none';
  className?: string;
  readonly options: readonly A[];
  onChange(n: A): void;
}

export function InputSelect<A extends string>({
  id,
  hasError,
  initialValue,
  onChange,
  className,
  options,
  ref,
}: IInputSelect<A>) {
  const [selected, setSelected] = useState(initialValue);
  return (
    <select
      ref={ref}
      data-error={hasError}
      className={classNames(
        'input w-full',
        hasError ? 'text-thmError' : selected === 'none' ? 'text-thmFgDim' : 'text-thmFg',
        className
      )}
      id={id}
      {...(hasError && {
        'aria-describedby': `${id}-error`,
      })}
      value={selected}
      onChange={({ target }) => {
        const v = target.value as unknown as A;
        setSelected(v);
        onChange(v);
      }}
    >
      {initialValue === 'none' && (
        <option disabled value="none" className="hidden text-thmGood">
          {' '}
          -- select an option --{' '}
        </option>
      )}
      {options.map((option) => (
        <option key={option} value={option} className="">
          {option}
        </option>
      ))}
    </select>
  );
}

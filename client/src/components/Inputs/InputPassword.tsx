import classNames from 'classnames';
import { forwardRef } from 'react';

export type IInputPassword = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type'
> &
  Required<Pick<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'placeholder'>> & {
    hasError?: boolean;
    type?: 'password' | 'text';
    onChange(n: string): void;
  };

export const InputPassword = forwardRef<HTMLInputElement, IInputPassword>(
  ({ id, hasError, value, onChange, className, type = 'password', ...props }, ref) => (
    <input
      ref={ref}
      data-error={hasError}
      className={classNames('input w-full', className)}
      id={id}
      type={type}
      {...(hasError && {
        'aria-describedby': `${id}-error`,
      })}
      value={value}
      onChange={({ target: { value: n } }) => {
        onChange(n);
      }}
      {...props}
    />
  )
);

import classNames from 'classnames';

export type IInputText = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> &
  Required<Pick<React.InputHTMLAttributes<HTMLInputElement>, 'id'>> & {
    hasError?: boolean;
    onChange(n: string): void;
  };

export function InputText({
  min,
  max,
  id,
  hasError,
  value,
  onChange,
  className,
  ...props
}: IInputText): JSX.Element {
  return (
    <input
      data-error={hasError}
      className={classNames('input', className)}
      id={id}
      type="text"
      {...(hasError && {
        'aria-describedby': `${id}-error`,
      })}
      value={value}
      onChange={({ target: { value: n } }) => {
        onChange(n);
      }}
      {...props}
    />
  );
}

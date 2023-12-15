import classNames from 'classnames';

export type IInputNumber = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> &
  Required<Pick<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'max' | 'min'>> & {
    hasError?: boolean;
    onChange(n: number): void;
  };

export function InputNumber({
  min,
  max,
  id,
  hasError,
  value,
  onChange,
  className,
  ...props
}: IInputNumber): JSX.Element {
  return (
    <input
      data-error={hasError}
      className={classNames('input', className)}
      id={id}
      type="number"
      {...(hasError && {
        'aria-describedby': `${id}-error`,
      })}
      min={min}
      max={max}
      value={value}
      onChange={({ target: { value: n } }) => {
        onChange(Number(n));
      }}
      {...props}
    />
  );
}

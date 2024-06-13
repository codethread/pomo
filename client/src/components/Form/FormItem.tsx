import { InputPassword } from '@client/components';
import { EyeClosed, EyeOpen } from '@client/components/Icons';
import { IChildren, ICss } from '@shared/types';
import classNames from 'classnames';
import React, { useRef, useState, useId } from 'react';
import { FieldValues, Path, useFormContext, UseFormRegister } from 'react-hook-form';

type ICheckbox = {
  disabled?: boolean;
  ariaLabel?: string;
  smallPrint?: string;
};

export function FormItemCheckbox<A extends FieldValues>({
  label,
  className,
  errord,
  disabled,
  ariaLabel,
  smallPrint,
  ...rest
}: ICheckbox & IFormItem<A>): JSX.Element {
  const id = `${label}form-input`;
  const { register, getFieldState } = useFormContext<FieldValues>();
  const { error } = getFieldState(label);
  // todo required
  return (
    <div className="flex max-w-md flex-col gap-3">
      <label
        htmlFor={id}
        className={classNames(
          'flex cursor-pointer items-center space-x-2',
          {
            'text-thmBackgroundBrightest': disabled,
            'cursor-not-allowed': disabled,
            'text-thmError': Boolean(error?.message),
          },
          className
        )}
        aria-label={ariaLabel}
      >
        <input
          disabled={disabled}
          className="m-0 grid h-5 w-5 cursor-pointer appearance-none place-content-center rounded bg-thmBackgroundBrightest outline-none transition-all focus:ring focus:ring-thmBright disabled:cursor-not-allowed disabled:bg-thmBackgroundSubtle disabled:text-thmBackgroundBright"
          id={id}
          type="checkbox"
          {...register(label, rest)}
        />
        <p>{label}</p>
      </label>
      {smallPrint ? <p className="text-xs">{smallPrint}</p> : null}
      {error?.message && (
        <ErrorMsg id={`${id}-error`} aria-live="polite">
          {error.message}
        </ErrorMsg>
      )}
    </div>
  );
}

type IFormItem<A extends FieldValues> = ICss &
  Omit<IFormItemContainer<A>, 'children'> & { errord?: any } & { placeholder?: string };

export function FormItemNumber<A extends FieldValues>({
  label,
  className,
  placeholder,
  errord,
  ...rest
}: IFormItem<A>): JSX.Element {
  const id = `${label}-${useId()}`;
  const { register, getFieldState } = useFormContext<FieldValues>();
  const { error } = getFieldState(label);
  const hasError = Boolean(error);
  return (
    <FormItem id={id} label={label} {...rest}>
      <input
        data-error={hasError}
        placeholder={placeholder}
        className={classNames('input', className)}
        id={id}
        type="number"
        {...(hasError && {
          'aria-describedby': `${id}-error`,
        })}
        {...register(label, { valueAsNumber: true, ...rest })}
      />
    </FormItem>
  );
}

export function FormItemText<A extends FieldValues>({
  label,
  className,
  placeholder,
  errord,
  ...rest
}: IFormItem<A>): JSX.Element {
  const id = `${label}-${useId()}`;
  const { register, getFieldState } = useFormContext<FieldValues>();
  const { error } = getFieldState(label);
  const hasError = Boolean(error);
  return (
    <FormItem id={id} label={label} {...rest}>
      <input
        data-error={hasError}
        className={classNames('input', className)}
        placeholder={placeholder}
        id={id}
        type="text"
        {...(hasError && {
          'aria-describedby': `${id}-error`,
        })}
        {...register(label, rest)}
      />
    </FormItem>
  );
}

export function FormItemPassword<A extends FieldValues>({
  label,
  placeholder,
  errord,
  ...rest
}: Omit<IFormItem<A>, 'children'> & { placeholder?: string }): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const { register, getFieldState } = useFormContext<FieldValues>();
  const registered = register(label, rest);
  const id = `${label}-${useId()}`;

  const inputEl = useRef<HTMLInputElement | null>(null);
  const { error } = getFieldState(label);
  const hasError = Boolean(error);

  return (
    <FormItem id={id} label={label} {...rest}>
      <div className="flex gap-1">
        <div className="grow">
          <InputPassword
            id={id}
            placeholder={placeholder ?? label}
            type={isVisible ? 'text' : 'password'}
            hasError={hasError}
            {...registered}
            ref={(e) => {
              registered.ref(e);
              inputEl.current = e;
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            toggleVisibility();
          }}
          className="input bg-thmBackgroundBright"
        >
          {isVisible ? (
            <EyeOpen color="bright" size="20px" />
          ) : (
            <EyeClosed color="bright" size="20px" />
          )}
        </button>
      </div>
    </FormItem>
  );

  function toggleVisibility(): void {
    setIsVisible(!isVisible);
    inputEl.current?.focus();
  }
}

type ReactFormItem = Parameters<UseFormRegister<FieldValues>>[1];

type IFormItemContainer<A extends FieldValues> = IChildren &
  ReactFormItem & {
    label: Path<A>;
    ariaLabel?: string;
  };

export function FormItem<A extends FieldValues>({
  label,
  children,
  ariaLabel,
  required,
  id,
}: IFormItemContainer<A> & { id: string }): JSX.Element {
  const { getFieldState } = useFormContext<A>();
  const { error } = getFieldState(label);
  return (
    <div className="flex max-w-md flex-col gap-1">
      <label
        htmlFor={id}
        aria-label={ariaLabel}
        className="flex flex-col items-stretch justify-start"
      >
        <span
          className={classNames({
            "after:ml-0.5 after:text-thmError after:content-['*']": required,
          })}
        >
          {label}
        </span>
        {children}
      </label>
      {error?.message && (
        <ErrorMsg id={`${id}-error`} aria-live="polite">
          {error.message}
        </ErrorMsg>
      )}
    </div>
  );
}

function ErrorMsg({
  children,
  ...props
}: IChildren & React.HTMLAttributes<HTMLParagraphElement>): JSX.Element {
  return (
    <p {...props} className="text-thmError">
      {children}
    </p>
  );
}

// function Form<A extends FieldValues>({ children, onSubmit }: IChildren & {
//   onSubmit: SubmitHandler<A>
// }) {
// 	const methods = useForm<A>({});
// 	const { isSubmitted, isValid, isDirty } = methods.formState;
// 	const hasError = not(isValid);
// 	// prettier-ignore
// 	const allowSubmit = or(
//     and(not(isDirty), not(isSubmitted)),
//     isValid
//   );
//   return (
// 				<FormProvider {...methods}>
// 					<form onSubmit={methods.handleSubmit(onSubmit)}>
//       {children}
// 					</form>
// 				</FormProvider>
//   )
// }

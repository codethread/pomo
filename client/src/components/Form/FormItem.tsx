import { ErrorMessage } from '@hookform/error-message';
import { IChildren, ICss } from '@shared/types';
import classNames from 'classnames';
import React, { useRef, useState, useId } from 'react';
import {
  FieldValues,
  Path,
  useFormContext,
  UseFormRegister,
} from 'react-hook-form';
import { IInputPassword, InputPassword } from '../Inputs/InputPassword';
import { EyeClosed } from '../Icons/EyeClosed';
import { EyeOpen } from '../Icons/EyeOpen';

type ICheckbox = IChildren & {
  disabled?: boolean;
  ariaLabel?: string;
  smallPrint?: string;
};

export function FormItemCheckbox<A extends FieldValues>({
  className,
  disabled,
  ariaLabel,
  smallPrint,
  children,
  ...rest
}: ICheckbox & Omit<IFormItem<A>, 'label'>): JSX.Element {
  const registerOptions = {
    ...rest,
    valueAsNumber: rest.valueAsNumber as false,
    valueAsDate: rest.valueAsDate as false,
  };
  const id = `${registerOptions.name}-${useId()}`;
  const {
    formState: { errors },
  } = useFormContext<A>();
  const { register, getFieldState } = useFormContext<FieldValues>();
  const { error } = getFieldState(registerOptions.name);

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
          className,
        )}
        aria-label={ariaLabel}
      >
        {children}
        <input
          disabled={disabled}
          className="m-0 grid h-5 w-5 cursor-pointer appearance-none place-content-center rounded bg-thmBackgroundBrightest outline-none transition-all focus:ring focus:ring-thmBright disabled:cursor-not-allowed disabled:bg-thmBackgroundSubtle disabled:text-thmBackgroundBright"
          id={id}
          type="checkbox"
          {...register(registerOptions.name, registerOptions)}
        />
      </label>
      {smallPrint ?
        <p className="text-xs">{smallPrint}</p>
      : null}
      <ErrorMessage
        errors={errors}
        name={registerOptions.name as any}
        as={ErrorMsg}
      />
    </div>
  );
}

export function FormItemNumber<A extends FieldValues>({
  label,
  className,
  placeholder,
  ...rest
}: IFormItem<A>): JSX.Element {
  const registerOptions = {
    ...rest,
    valueAsNumber: true as false,
    valueAsDate: rest.valueAsDate as false,
  };
  const id = `${label}-${useId()}`;
  const { register, getFieldState } = useFormContext<FieldValues>();
  const { error } = getFieldState(registerOptions.name);
  const hasError = Boolean(error);
  return (
    <FormItem id={id} label={label} {...registerOptions}>
      <input
        data-error={hasError}
        placeholder={placeholder}
        className={classNames('input', className)}
        id={id}
        type="number"
        {...(hasError && {
          'aria-describedby': `${id}-error`,
        })}
        {...register(registerOptions.name, registerOptions)}
      />
    </FormItem>
  );
}

export function FormItemText<A extends FieldValues>({
  label,
  className,
  placeholder,
  ...rest
}: IFormItem<A>): JSX.Element {
  const registerOptions = {
    ...rest,
    valueAsNumber: false as const,
    valueAsDate: rest.valueAsDate as false,
  };
  const id = `${registerOptions.name}-${useId()}`;
  const { register, getFieldState } = useFormContext<FieldValues>();
  const { error } = getFieldState(registerOptions.name);
  const hasError = Boolean(error);
  return (
    <FormItem id={id} label={label} {...registerOptions}>
      <input
        data-error={hasError}
        className={classNames('input', className)}
        placeholder={placeholder}
        id={id}
        type="text"
        {...(hasError && {
          'aria-describedby': `${id}-error`,
        })}
        {...register(registerOptions.name, registerOptions)}
      />
    </FormItem>
  );
}

export function FormItemPassword<A extends FieldValues>({
  label,
  placeholder,
  className,
  ...rest
}: IFormItem<A> & Omit<IInputPassword, 'id'>): JSX.Element {
  const registerOptions = {
    ...rest,
    valueAsNumber: false as const,
    valueAsDate: rest.valueAsDate as false,
  };

  const [isVisible, setIsVisible] = useState(false);
  const { register, getFieldState } = useFormContext<FieldValues>();
  const registered = register(registerOptions.name, registerOptions);
  const id = `${registerOptions.name}-${useId()}`;

  const inputEl = useRef<HTMLInputElement | null>(null);
  const { error } = getFieldState(registerOptions.name);
  const hasError = Boolean(error);

  return (
    <FormItem id={id} label={label} {...registerOptions}>
      <div className="flex gap-1">
        <div className="grow">
          <InputPassword
            id={id}
            className={className}
            placeholder={placeholder}
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
            setIsVisible(!isVisible);
            inputEl.current?.focus();
          }}
          className="input bg-thmBackgroundBright"
        >
          {isVisible ?
            <EyeOpen color="bright" size="20px" />
          : <EyeClosed color="bright" size="20px" />}
        </button>
      </div>
    </FormItem>
  );
}

type IFormItem<A extends FieldValues> = ICss &
  Omit<IFormItemContainer<A>, 'children'> & { placeholder?: string };

type ReactFormItem = Parameters<UseFormRegister<FieldValues>>[1];

type IFormItemContainer<A extends FieldValues> = ReactFormItem & {
  label: string;
  name: Path<A>;
  ariaLabel?: string;
  children: React.ReactNode;
};

function FormItem<A extends FieldValues>({
  label,
  children,
  ariaLabel,
  required,
  id,
  name,
}: IFormItemContainer<A> & { id: string }): JSX.Element {
  const {
    formState: { errors },
  } = useFormContext<A>();
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
      <ErrorMessage errors={errors} name={name as any} as={ErrorMsg} />
    </div>
  );
}

function ErrorMsg({ children }: IChildren): JSX.Element {
  return <p className="text-thmError"> {children} </p>;
}

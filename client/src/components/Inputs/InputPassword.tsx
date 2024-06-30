import classNames from "classnames";
import { forwardRef } from "react";

export type IInputPassword = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> &
  Required<
    Pick<React.InputHTMLAttributes<HTMLInputElement>, "id" | "placeholder">
  > & {
    hasError?: boolean;
    type?: "password" | "text";
  };

export const InputPassword = forwardRef<HTMLInputElement, IInputPassword>(
  ({ id, hasError, className, type = "password", ...props }, ref) => (
    <input
      ref={ref}
      data-error={hasError}
      className={classNames("input w-full", className)}
      id={id}
      type={type}
      {...(hasError && {
        "aria-describedby": `${id}-error`,
      })}
      {...props}
    />
  ),
);

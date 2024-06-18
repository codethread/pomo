import { Box, Checkbox } from '@client/components';
import { twJoin } from 'tailwind-merge';
import { ReactNode, useEffect } from 'react';
import { FormItemCheckbox } from '../Form/FormItem';
import { useFormContext } from 'react-hook-form';

interface ISettingCommon {
  heading: string;
  children: ReactNode;
  onSubmit(): void;
}

interface ISettingSimple extends ISettingCommon {
  variant: 'simple';
}

interface ISettingToggle extends ISettingCommon {
  variant: 'toggle';
  checked: boolean;
  onToggle(checked: boolean): void;
}

type ISetting = ISettingSimple | ISettingToggle;

export function Setting({ children, heading, onSubmit, ...props }: ISetting): JSX.Element {
  const methods = useFormContext();
  const { reset, formState, getValues } = methods;
  const { isSubmitSuccessful, isDirty, isValid, isSubmitted } = formState;
  const hasError = isSubmitted && !isValid;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(getValues());
    }
  }, [isSubmitSuccessful, reset, getValues]);

  return (
    <Box
      className={twJoin(
        'mb-8 mt-4 border-l-2',
        hasError ? 'border-thmError' : isDirty ? 'border-thmSecondary' : 'border-thmBackground'
      )}
    >
      <div className="mb-4 bg-thmBackgroundSubtle py-2 px-2">
        {props.variant === 'toggle' ? (
          <FormItemCheckbox name="">
            <h2 className="text-lg">{heading}</h2>
          </FormItemCheckbox>
        ) : (
          <h2 className="text-lg">{heading}</h2>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="mx-2 flex flex-col gap-3"
      >
        {children}
      </form>
    </Box>
  );
}

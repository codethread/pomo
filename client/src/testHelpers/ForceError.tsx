import { FC } from 'react';

interface IForceError {
  errorMessage: string;
}

export const ForceError: FC<IForceError> = ({ errorMessage }) => {
  throw new Error(errorMessage);
};

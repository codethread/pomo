import React, { Component, ErrorInfo, ReactNode } from 'react';
import testIds from '@shared/testids';
import { IClientLogger } from '@shared/types';
import { useLogger } from '@client/hooks';

interface Props {
  children: ReactNode;
  logger: IClientLogger;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { props } = this;
    props.logger.error(`[ErrorBoundary error] ${error.message}\n${errorInfo.componentStack}`);
  }

  public render(): ReactNode {
    const { props, state } = this;
    if (state.hasError) {
      return <h1 data-testid={testIds.ERROR_BOUNDARY_MESSAGE}>Something went wrong.</h1>;
    }
    return props.children;
  }
}

export default function WrappedError({ children }: { children: ReactNode }): JSX.Element {
  const logger = useLogger();

  // @ts-expect-error I'm really not sure why this is complaining
  return <ErrorBoundary logger={logger}>{children}</ErrorBoundary>;
}

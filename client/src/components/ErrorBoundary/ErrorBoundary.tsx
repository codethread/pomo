import { Component, ErrorInfo, ReactNode } from 'react';
import testIds from '@shared/testids';
import { IClientLogger } from '@shared/types';
import { useLogger } from '@client/hooks/useLogger';

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

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { props } = this;
    props.logger.error(
      `[ErrorBoundary error] ${error.message}\n${errorInfo.componentStack}`,
    );
  }

  public render(): ReactNode {
    const { props, state } = this;
    if (state.hasError) {
      return (
        <h1 data-testid={testIds.ERROR_BOUNDARY_MESSAGE}>
          Something went wrong.
        </h1>
      );
    }
    return props.children;
  }
}

export default function WrappedError({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const logger = useLogger();

  return <ErrorBoundary logger={logger}>{children}</ErrorBoundary>;
}

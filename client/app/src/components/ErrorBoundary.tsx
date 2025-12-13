import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  info?: React.ErrorInfo;
};

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, info });
    // Optionally log to an external service
    console.error("Runtime error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>
            Something went wrong.
          </h1>
          {this.state.error && (
            <pre style={{ whiteSpace: "pre-wrap", color: "#b00020" }}>
              {this.state.error.message}
            </pre>
          )}
          {this.state.info && (
            <details style={{ marginTop: 12 }}>
              <summary>Stack trace</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {this.state.info.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

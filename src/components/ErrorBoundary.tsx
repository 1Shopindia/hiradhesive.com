import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportError } from "@/lib/error-reporting";

type Props = {
  children: ReactNode;
  /** Short label used in logs so we can tell boundaries apart. */
  name?: string;
  /** Custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type State = { error: Error | null };

/**
 * Client-side error boundary. Keeps a render failure inside one section of the
 * page instead of blanking the whole app, and forwards the error to reporting.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ""}]`, error);
    reportError(error, {
      boundary: this.props.name ?? "component",
      componentStack: info.componentStack ?? undefined,
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        className="mx-auto my-10 max-w-lg rounded-2xl border border-border bg-card p-6 text-center shadow-soft"
      >
        <h2 className="text-lg font-semibold">Something went wrong here</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This section couldn&apos;t be displayed. The rest of the page still works.
        </p>
        <button
          type="button"
          onClick={this.reset}
          className="mt-5 inline-flex items-center rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5"
        >
          Try again
        </button>
      </div>
    );
  }
}

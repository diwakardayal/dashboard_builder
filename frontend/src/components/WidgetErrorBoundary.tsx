import React from "react";

interface Props {
  widgetTitle: string;
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

export class WidgetErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : "Unknown error" };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error(`Widget "${this.props.widgetTitle}" crashed:`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="widget-error">
          <strong>{this.props.widgetTitle}</strong> failed to render.
          <div style={{ fontSize: 11, opacity: 0.7 }}>{this.state.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

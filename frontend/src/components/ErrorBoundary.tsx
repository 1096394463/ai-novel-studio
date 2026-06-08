import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: 40,
              textAlign: "center",
              fontFamily: "sans-serif",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ marginBottom: 8, color: "#c0392b" }}>
              页面加载出错
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: 14,
                maxWidth: 400,
                marginBottom: 16,
              }}
            >
              {this.state.error?.message || "未知错误"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                padding: "8px 24px",
                border: "1px solid #ccc",
                borderRadius: 6,
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              刷新页面
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error("🚨 Error capturado por ErrorBoundary:", error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 Error Boundary - Detalles:", {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>😕 ¡Oops! Algo salió mal</h1>
            <p style={styles.message}>
              Lo sentimos, ha ocurrido un error inesperado.
            </p>
            {this.state.error && (
              <pre style={styles.errorDetail}>
                {this.state.error.toString()}
              </pre>
            )}
            <button onClick={this.handleReset} style={styles.button}>
              🏠 Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "20px",
  },
  content: {
    textAlign: "center" as const,
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "500px",
  },
  title: {
    fontSize: "28px",
    color: "#e74c3c",
    marginBottom: "15px",
  },
  message: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "20px",
  },
  errorDetail: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "15px",
    borderRadius: "6px",
    fontSize: "12px",
    textAlign: "left" as const,
    overflow: "auto",
    marginBottom: "20px",
  },
  button: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold" as const,
  },
};

export default ErrorBoundary;

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    console.error("🚨 Error capturado por ErrorBoundary:", error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 Error Boundary - Detalles completos:", {
      error: error.toString(),
      errorName: error.name,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    this.setState((prev) => ({
      errorCount: prev.errorCount + 1,
    }));
  }

  private handleReset = () => {
    console.log("🔄 Reseteando ErrorBoundary...");
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  private handleReload = () => {
    console.log("🔄 Recargando página...");
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>😕 ¡Oops! Algo salió mal</h1>
            <p style={styles.message}>
              Lo sentimos, ha ocurrido un error inesperado en la aplicación.
            </p>

            {this.state.error && (
              <>
                <div style={styles.errorTypeBox}>
                  <strong>Tipo de Error:</strong>
                  <p>{this.state.error.name}</p>
                </div>

                <div style={styles.errorDetailBox}>
                  <strong>Detalles:</strong>
                  <pre style={styles.errorDetail}>
                    {this.state.error.toString()}
                  </pre>
                </div>

                <div style={styles.errorCountBox}>
                  <strong>Errores capturados:</strong>
                  <p>{this.state.errorCount}</p>
                </div>
              </>
            )}

            <div style={styles.buttonGroup}>
              <button onClick={this.handleReset} style={styles.buttonPrimary}>
                🏠 Volver al inicio
              </button>
              <button
                onClick={this.handleReload}
                style={styles.buttonSecondary}
              >
                🔄 Recargar página
              </button>
            </div>

            <p style={styles.footer}>
              ℹ️ Revisa la consola (F12) para más detalles
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: "flex" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
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
    maxWidth: "600px",
    border: "3px solid #e74c3c",
  },
  title: {
    fontSize: "32px",
    color: "#e74c3c",
    marginBottom: "15px",
    margin: "0 0 15px 0",
  },
  message: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "20px",
  },
  errorTypeBox: {
    backgroundColor: "#ffe5e5",
    border: "2px solid #ff9999",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "15px",
    textAlign: "left" as const,
  },
  errorDetailBox: {
    backgroundColor: "#f8d7da",
    border: "2px solid #f5c6cb",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    textAlign: "left" as const,
  },
  errorDetail: {
    backgroundColor: "white",
    color: "#721c24",
    padding: "10px",
    borderRadius: "4px",
    fontSize: "12px",
    textAlign: "left" as const,
    overflow: "auto" as const,
    maxHeight: "200px",
    margin: "10px 0 0 0",
  },
  errorCountBox: {
    backgroundColor: "#fff3cd",
    border: "2px solid #ffc107",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "20px",
    textAlign: "left" as const,
  },
  buttonGroup: {
    display: "flex" as const,
    gap: "10px",
    justifyContent: "center" as const,
    marginBottom: "15px",
    flexWrap: "wrap" as const,
  },
  buttonPrimary: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "bold" as const,
    transition: "all 0.2s",
  },
  buttonSecondary: {
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "bold" as const,
    transition: "all 0.2s",
  },
  footer: {
    fontSize: "12px",
    color: "#7f8c8d",
    marginTop: "15px",
    marginBottom: "0",
  },
};

export default ErrorBoundary;

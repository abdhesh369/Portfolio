import React, { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "#src/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full space-y-8 text-center bg-card p-8 rounded-2xl border border-destructive/20 shadow-2xl relative overflow-hidden group">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 blur-3xl -z-10 group-hover:bg-destructive/20 transition-colors" />

            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10 text-destructive animate-pulse">
                <AlertCircle className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Oops! Something went wrong.</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We've hit an unexpected snag while loading this page. 
                Don't worry—try reloading the application or heading back to the homepage.
              </p>
            </div>

            {import.meta.env.MODE === "development" && this.state.error && (
              <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-left font-mono text-xs overflow-auto max-h-32 text-red-300">
                <p className="font-bold mb-1 uppercase tracking-wider text-[10px] opacity-70">Error Trace:</p>
                {this.state.error.message}
                <div className="mt-2 opacity-50 whitespace-normal">
                  {this.state.error.stack?.split("\n").slice(0, 3).join("\n")}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={this.handleReset}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Reload System
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex-1 border-white/10 hover:bg-white/5 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return to Base
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

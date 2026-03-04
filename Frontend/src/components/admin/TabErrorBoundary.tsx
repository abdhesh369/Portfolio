import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: React.ReactNode;
    tabName?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Lightweight ErrorBoundary for individual admin tabs.
 * Catches rendering errors within a single tab without crashing the entire dashboard.
 */
export class TabErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`[Admin Tab Error${this.props.tabName ? ` — ${this.props.tabName}` : ""}]:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="text-red-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-white/90">
                        Something went wrong
                    </h3>
                    <p className="text-sm text-white/50 max-w-md">
                        {this.state.error?.message || "An unexpected error occurred in this tab."}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: undefined })}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition-colors text-sm font-medium"
                    >
                        <RefreshCw size={14} />
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

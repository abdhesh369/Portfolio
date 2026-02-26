import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-6">
                    <div className="max-w-md text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-white/60 mb-8">
                            We've encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <Button onClick={() => (window.location.href = "/")}>
                            Go to Homepage
                        </Button>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="mt-8 text-left text-xs bg-red-950/20 p-4 rounded border border-red-500/20 overflow-auto text-red-100">
                                {this.state.error.toString()}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

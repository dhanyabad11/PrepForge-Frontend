"use client";

import { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Something went wrong
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {this.state.error?.message || "An unexpected error occurred"}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

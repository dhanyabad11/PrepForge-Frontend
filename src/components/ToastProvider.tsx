"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                // Define default options
                duration: 4000,
                style: {
                    background: "#363636",
                    color: "#fff",
                },
                // Default options for specific types
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: "#10b981",
                        secondary: "#fff",
                    },
                },
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: "#ef4444",
                        secondary: "#fff",
                    },
                },
                loading: {
                    iconTheme: {
                        primary: "#3b82f6",
                        secondary: "#fff",
                    },
                },
            }}
        />
    );
}

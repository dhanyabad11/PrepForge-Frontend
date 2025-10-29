import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ToastProvider from "@/components/ToastProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "PrepForge - AI-Powered Interview Practice",
    description:
        "Generate personalized interview questions and practice with AI feedback. Perfect your interview skills with PrepForge.",
    manifest: "/manifest.json",
    themeColor: "#3b82f6",
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "PrepForge",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <AuthProvider>
                    <ToastProvider />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

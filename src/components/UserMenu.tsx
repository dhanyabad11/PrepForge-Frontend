"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function UserMenu() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    if (status === "loading") {
        return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>;
    }

    if (!session) {
        return (
            <button onClick={() => signIn()} className="btn-secondary px-4 py-2 text-sm">
                Sign In
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                {session.user?.image ? (
                    <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: "var(--accent)" }}
                    >
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                    </div>
                )}
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {session.user?.name || session.user?.email}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                            {session.user?.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {session.user?.email}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            signOut();
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: "var(--foreground)" }}
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}

"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function UserMenu() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Format user name to title case
    const formatName = (name: string) => {
        return name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    if (status === "loading") {
        return (
            <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <button
                onClick={() => signIn()}
                className="btn-primary px-6 py-2.5 text-sm font-medium hover:shadow-md transition-all duration-200"
            >
                Sign In
            </button>
        );
    }

    const displayName = session.user?.name ? formatName(session.user.name) : session.user?.email;
    const initials = session.user?.name
        ? session.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : session.user?.email?.charAt(0).toUpperCase() || "U";

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 p-2 pr-4 rounded-xl hover:shadow-sm transition-all duration-200 border"
                style={{
                    background: isOpen ? "var(--accent-light)" : "var(--background-pure)",
                    borderColor: isOpen ? "var(--accent)" : "var(--border)",
                    color: "var(--foreground)",
                }}
            >
                {session.user?.image ? (
                    <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full ring-2 ring-gray-100 shadow-sm"
                    />
                ) : (
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm ring-2 ring-white"
                        style={{
                            background: "linear-gradient(135deg, var(--accent), #3b82f6)",
                        }}
                    >
                        {initials}
                    </div>
                )}
                <div className="flex flex-col items-start">
                    <span
                        className="text-sm font-semibold leading-tight"
                        style={{ color: "var(--foreground)" }}
                    >
                        {displayName}
                    </span>
                    <span
                        className="text-xs leading-tight"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {session.user?.email}
                    </span>
                </div>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                    style={{ color: "var(--text-secondary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-3 w-64 rounded-2xl shadow-xl border py-3 z-50 user-menu-dropdown"
                    style={{
                        background: "var(--background-pure)",
                        borderColor: "var(--border)",
                        backdropFilter: "blur(20px)",
                        boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                >
                    {/* User Info Header */}
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div className="flex items-center space-x-3">
                            {session.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full ring-2 ring-blue-100 ring-offset-2"
                                />
                            ) : (
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, var(--accent), #3b82f6)",
                                    }}
                                >
                                    {initials}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-semibold truncate"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    {displayName}
                                </p>
                                <p
                                    className="text-xs truncate"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {session.user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <a
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center w-full px-4 py-3 text-sm transition-colors group user-menu-item rounded-lg mx-2"
                            style={{
                                color: "var(--foreground)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--accent-light)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                            }}
                        >
                            <svg
                                className="w-4 h-4 mr-3 transition-colors"
                                style={{ color: "var(--text-secondary)" }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 1v6h8V1"
                                />
                            </svg>
                            <span className="font-medium">Dashboard</span>
                        </a>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut();
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm transition-colors group text-red-600 user-menu-item rounded-lg mx-2"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                            }}
                        >
                            <svg
                                className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-500 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

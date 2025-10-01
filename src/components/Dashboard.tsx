"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface QuestionSet {
    id: string;
    jobRole: string;
    company: string;
    isBookmarked: boolean;
    createdAt: string;
    questions: Array<{
        id: string;
        text: string;
        category: string;
    }>;
}

interface UserStats {
    totalQuestionSets: number;
    totalInterviews: number;
    bookmarkedSets: number;
    completedInterviews: number;
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "authenticated") {
            fetchUserData();
        }
    }, [status]);

    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

            // Fetch question sets
            const setsResponse = await fetch(`${backendUrl}/api/db/question-sets`, {
                headers: {
                    "x-user-email": session?.user?.email || "",
                    "x-user-name": session?.user?.name || "",
                    "x-user-image": session?.user?.image || "",
                },
            });

            if (setsResponse.ok) {
                const setsData = await setsResponse.json();
                setQuestionSets(setsData.questionSets || []);
            }

            // Fetch user stats
            const statsResponse = await fetch(`${backendUrl}/api/db/stats`, {
                headers: {
                    "x-user-email": session?.user?.email || "",
                    "x-user-name": session?.user?.name || "",
                    "x-user-image": session?.user?.image || "",
                },
            });

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData.stats);
            }
        } catch (err) {
            setError("Failed to load dashboard data");
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.email, session?.user?.name, session?.user?.image]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchUserData();
        }
    }, [status, fetchUserData]);

    const handleBookmark = async (questionSetId: string, isCurrentlyBookmarked: boolean) => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
            const response = await fetch(
                `${backendUrl}/api/db/question-sets/${questionSetId}/bookmark`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-email": session?.user?.email || "",
                        "x-user-name": session?.user?.name || "",
                        "x-user-image": session?.user?.image || "",
                    },
                    body: JSON.stringify({ isBookmarked: !isCurrentlyBookmarked }),
                }
            );

            if (response.ok) {
                setQuestionSets((prev) =>
                    prev.map((qs) =>
                        qs.id === questionSetId
                            ? { ...qs, isBookmarked: !isCurrentlyBookmarked }
                            : qs
                    )
                );
            }
        } catch (err) {
            console.error("Bookmark error:", err);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: "var(--color-primary)" }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p style={{ color: "var(--color-secondary)" }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: "var(--color-primary)" }}
            >
                <div className="text-center">
                    <h1
                        className="text-2xl font-bold mb-4"
                        style={{ color: "var(--color-secondary)" }}
                    >
                        Please Sign In
                    </h1>
                    <p style={{ color: "var(--color-accent)" }}>
                        You need to be signed in to view your dashboard.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: "var(--color-primary)" }}
            >
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={fetchUserData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-primary)" }}>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1
                            className="text-3xl font-bold mb-2"
                            style={{ color: "var(--color-secondary)" }}
                        >
                            Dashboard
                        </h1>
                        <p style={{ color: "var(--color-accent)" }}>
                            Welcome back, {session?.user?.name}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Question Sets
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.totalQuestionSets}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Interviews
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.totalInterviews}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Bookmarked
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.bookmarkedSets}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Completed
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.completedInterviews}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Question Sets */}
                    <div>
                        <h2
                            className="text-2xl font-bold mb-6"
                            style={{ color: "var(--color-secondary)" }}
                        >
                            Your Question Sets
                        </h2>

                        {questionSets.length === 0 ? (
                            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                                <p className="text-gray-500 mb-4">No question sets found</p>
                                <Link
                                    href="/"
                                    className="inline-block px-6 py-2 rounded-lg font-medium transition-colors"
                                    style={{
                                        backgroundColor: "var(--color-accent)",
                                        color: "white",
                                    }}
                                >
                                    Generate Your First Questions
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {questionSets.map((questionSet) => (
                                    <div
                                        key={questionSet.id}
                                        className="bg-white rounded-lg p-6 shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1">
                                                    {questionSet.jobRole}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    {questionSet.company}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleBookmark(
                                                        questionSet.id,
                                                        questionSet.isBookmarked
                                                    )
                                                }
                                                className={`p-2 rounded-full transition-colors ${
                                                    questionSet.isBookmarked
                                                        ? "text-yellow-500 hover:text-yellow-600"
                                                        : "text-gray-400 hover:text-gray-600"
                                                }`}
                                            >
                                                ★
                                            </button>
                                        </div>

                                        <p className="text-sm text-gray-500 mb-4">
                                            {questionSet.questions.length} questions •{" "}
                                            {new Date(questionSet.createdAt).toLocaleDateString()}
                                        </p>

                                        <div className="flex gap-2">
                                            <button
                                                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => {
                                                    /* TODO: View questions */
                                                }}
                                            >
                                                View Questions
                                            </button>
                                            <button
                                                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                                                style={{ backgroundColor: "var(--color-accent)" }}
                                                onClick={() => {
                                                    /* TODO: Start interview */
                                                }}
                                            >
                                                Start Interview
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    LineChart,
    Line,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface PerformanceData {
    date: string;
    averageRelevance: number;
    averageClarity: number;
    averageDepth: number;
    averageOverall: number;
    questionsAnswered: number;
}

interface WeakArea {
    type?: string;
    category?: string;
    averageScore: number;
    count: number;
}

interface SkillProgression {
    behavioral: number;
    technical: number;
    situational: number;
    communication: number;
}

interface UserStats {
    totalInterviews: number;
    totalAnswers: number;
    averageScore: number;
    currentStreak: number;
}

interface Analytics {
    performanceOverTime: PerformanceData[];
    weakAreas: {
        weakTypes: WeakArea[];
        weakCategories: WeakArea[];
    };
    skillProgression: SkillProgression;
    userStats: UserStats;
}

export default function AnalyticsPage() {
    const { data: session, status } = useSession();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (status === "authenticated" && session?.user?.email) {
                try {
                    setLoading(true);
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

                    // First get user ID
                    const userRes = await fetch(
                        `${backendUrl}/api/db/users/by-email/${session.user.email}`
                    );
                    if (!userRes.ok) {
                        throw new Error("Failed to fetch user profile.");
                    }
                    const userData = await userRes.json();

                    if (!userData.success || !userData.user) {
                        throw new Error("User not found");
                    }

                    // Fetch analytics
                    const analyticsRes = await fetch(
                        `${backendUrl}/api/analytics/${userData.user.id}`
                    );
                    if (!analyticsRes.ok) {
                        throw new Error("Failed to fetch analytics");
                    }

                    const analyticsData = await analyticsRes.json();
                    setAnalytics(analyticsData.analytics);
                    setError(null);
                } catch (err) {
                    const errorMessage =
                        err instanceof Error ? err.message : "Failed to load analytics";
                    setError(errorMessage);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchAnalytics();
    }, [status, session]);

    if (status === "loading" || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-6">Please sign in to view your analytics.</p>
                <Link
                    href="/api/auth/signin"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 text-red-700">
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-gray-600">No analytics data available.</p>
            </div>
        );
    }

    // Prepare skill radar data
    const skillData = [
        {
            skill: "Behavioral",
            level: analytics.skillProgression.behavioral,
            fullMark: 100,
        },
        {
            skill: "Technical",
            level: analytics.skillProgression.technical,
            fullMark: 100,
        },
        {
            skill: "Situational",
            level: analytics.skillProgression.situational,
            fullMark: 100,
        },
        {
            skill: "Communication",
            level: analytics.skillProgression.communication,
            fullMark: 100,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                            Performance Analytics 📈
                        </h1>
                        <p className="text-md text-gray-600 mt-1">
                            Track your progress and identify areas for improvement
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Performance Over Time */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.performanceOverTime}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <YAxis domain={[0, 10]} />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="averageRelevance"
                                stroke="#3b82f6"
                                name="Relevance"
                            />
                            <Line
                                type="monotone"
                                dataKey="averageClarity"
                                stroke="#10b981"
                                name="Clarity"
                            />
                            <Line
                                type="monotone"
                                dataKey="averageDepth"
                                stroke="#f59e0b"
                                name="Depth"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Skills Progression */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Skill Levels</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={skillData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="skill" />
                                <PolarRadiusAxis domain={[0, 100]} />
                                <Radar
                                    name="Your Skills"
                                    dataKey="level"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Weak Areas */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Areas to Improve 🎯
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">
                                    By Question Type
                                </h3>
                                {analytics.weakAreas.weakTypes.length > 0 ? (
                                    <div className="space-y-2">
                                        {analytics.weakAreas.weakTypes.map((area, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-3 bg-orange-50 rounded-lg"
                                            >
                                                <span className="font-medium text-gray-800 capitalize">
                                                    {area.type}
                                                </span>
                                                <span className="text-sm text-orange-600">
                                                    Avg: {area.averageScore.toFixed(1)}/10
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Not enough data yet</p>
                                )}
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">By Category</h3>
                                {analytics.weakAreas.weakCategories.length > 0 ? (
                                    <div className="space-y-2">
                                        {analytics.weakAreas.weakCategories.map((area, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                                            >
                                                <span className="font-medium text-gray-800 capitalize">
                                                    {area.category}
                                                </span>
                                                <span className="text-sm text-red-600">
                                                    Avg: {area.averageScore.toFixed(1)}/10
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Not enough data yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-500">Total Interviews</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {analytics.userStats.totalInterviews || 0}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-500">Questions Answered</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {analytics.userStats.totalAnswers || 0}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-500">Avg Score</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {(analytics.userStats.averageScore || 0).toFixed(1)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-500">Current Streak 🔥</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {analytics.userStats.currentStreak || 0} days
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

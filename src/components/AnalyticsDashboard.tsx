"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardSkeleton } from "./LoadingSkeleton";
import toast from "react-hot-toast";

interface AnalyticsData {
    period: {
        days: number;
        startDate: string;
        endDate: string;
    };
    overview: {
        totalInterviews: number;
        completedInterviews: number;
        totalQuestionsAnswered: number;
        averageScore: string;
    };
    scores: {
        overall: string;
        relevance: string;
        clarity: string;
        depth: string;
        communication: string;
    };
    skills: {
        behavioral: number;
        technical: number;
        situational: number;
        communication: number;
    };
    streaks: {
        current: number;
        longest: number;
        lastPractice: string;
    };
    trend: {
        trend: string;
        change: number;
        data: Array<{
            week: string;
            avgScore: number;
            count: number;
        }>;
    };
    recentActivity: Array<{
        id: number;
        role: string;
        company: string;
        date: string;
        status: string;
    }>;
}

export default function AnalyticsPage() {
    const { data: session } = useSession();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/history/analytics?days=${days}`,
                {
                    headers: {
                        "x-user-id": session?.user?.email || "anonymous",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch analytics");
            }

            const result = await response.json();
            setAnalytics(result.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.email) {
            fetchAnalytics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, days]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <DashboardSkeleton />
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
                    <p className="text-gray-600">Complete some interviews to see your analytics!</p>
                </div>
            </div>
        );
    }

    const getTrendIcon = (trend: string) => {
        if (trend === "improving") return "📈";
        if (trend === "declining") return "📉";
        return "➡️";
    };

    const getTrendColor = (trend: string) => {
        if (trend === "improving") return "text-green-600";
        if (trend === "declining") return "text-red-600";
        return "text-gray-600";
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Analytics</h1>
                    <p className="text-gray-600">
                        Track your progress and identify areas for improvement
                    </p>

                    {/* Time Period Selector */}
                    <div className="mt-4 flex gap-2">
                        {[7, 30, 90, 365].map((period) => (
                            <button
                                key={period}
                                onClick={() => setDays(period)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    days === period
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {period === 365 ? "1 Year" : `${period} Days`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {analytics.overview.totalInterviews}
                        </div>
                        <div className="text-sm text-gray-600">Total Interviews</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {analytics.overview.completedInterviews}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {analytics.overview.totalQuestionsAnswered}
                        </div>
                        <div className="text-sm text-gray-600">Questions Answered</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                            {analytics.overview.averageScore}/10
                        </div>
                        <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                </div>

                {/* Performance Trend */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Trend</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">{getTrendIcon(analytics.trend.trend)}</span>
                        <div>
                            <div
                                className={`text-2xl font-bold ${getTrendColor(
                                    analytics.trend.trend
                                )}`}
                            >
                                {analytics.trend.change > 0 ? "+" : ""}
                                {analytics.trend.change}%
                            </div>
                            <div className="text-gray-600 capitalize">
                                {analytics.trend.trend} over the period
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Score Breakdown</h2>
                    <div className="space-y-4">
                        {Object.entries(analytics.scores).map(([key, value]) => (
                            <div key={key}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-700 capitalize">{key}</span>
                                    <span className="font-semibold">{value}/10</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{ width: `${(parseFloat(value) / 10) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Skill Levels</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(analytics.skills).map(([skill, level]) => (
                            <div key={skill}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-700 capitalize">{skill}</span>
                                    <span className="font-semibold">{level}/100</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full transition-all"
                                        style={{ width: `${level}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Streaks */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Streaks</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-2xl font-bold text-orange-600 mb-1">
                                {analytics.streaks.current} days
                            </div>
                            <div className="text-sm text-gray-600">Current Streak</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-600 mb-1">
                                {analytics.streaks.longest} days
                            </div>
                            <div className="text-sm text-gray-600">Longest Streak</div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        {analytics.recentActivity.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {activity.role} at {activity.company}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {new Date(activity.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        activity.status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}
                                >
                                    {activity.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

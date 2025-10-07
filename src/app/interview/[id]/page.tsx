"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";

// Interfaces
interface Answer {
    id: number;
    question: string;
    answer: string;
    relevanceScore: number | null;
    clarityScore: number | null;
    depthScore: number | null;
    overallScore: number | null;
    strengths: string[] | null;
    improvements: string[] | null;
    createdAt: string;
}

interface InterviewDetails {
    interview: {
        id: number;
        jobRole: string;
        company: string;
        experience: string;
        difficulty: string;
        status: string;
        duration: number | null;
        createdAt: string;
    };
    answers: Answer[];
}

const StatCard = ({
    title,
    value,
    subValue,
}: {
    title: string;
    value: string | number;
    subValue?: string;
}) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
    </div>
);

const InterviewDetailPage = () => {
    const { id } = useParams();
    const { data: session, status } = useSession();
    const [details, setDetails] = useState<InterviewDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInterviewDetails = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
            const res = await fetch(`${backendUrl}/api/interview-details/${id}`);

            if (!res.ok) {
                throw new Error("Failed to fetch interview details.");
            }

            const data = await res.json();
            if (data.success) {
                setDetails(data.details);
            } else {
                throw new Error(data.message || "Could not retrieve details.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchInterviewDetails();
        }
    }, [status, fetchInterviewDetails]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-red-50 text-red-700">
                {error}
            </div>
        );
    }

    if (!details) {
        return <div className="text-center py-10">Interview not found.</div>;
    }

    const { interview, answers } = details;

    const overallScores = {
        relevance: (
            answers.reduce((acc, a) => acc + (a.relevanceScore || 0), 0) / answers.length
        ).toFixed(1),
        clarity: (
            answers.reduce((acc, a) => acc + (a.clarityScore || 0), 0) / answers.length
        ).toFixed(1),
        depth: (answers.reduce((acc, a) => acc + (a.depthScore || 0), 0) / answers.length).toFixed(
            1
        ),
    };

    const radarData = [
        { subject: "Relevance", score: parseFloat(overallScores.relevance), fullMark: 10 },
        { subject: "Clarity", score: parseFloat(overallScores.clarity), fullMark: 10 },
        { subject: "Depth", score: parseFloat(overallScores.depth), fullMark: 10 },
    ];

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            <header className="mb-6">
                <Link
                    href="/dashboard"
                    className="text-blue-600 hover:underline text-sm mb-2 block"
                >
                    &larr; Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">
                    {interview.jobRole} at {interview.company}
                </h1>
                <p className="text-md text-gray-500">
                    Interview taken on {new Date(interview.createdAt).toLocaleDateString()}
                </p>
            </header>

            {/* Summary Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Overall Score"
                    value={`${(
                        radarData.reduce((acc, r) => acc + r.score, 0) / radarData.length
                    ).toFixed(1)}/10`}
                />
                <StatCard title="Status" value={interview.status} />
                <StatCard title="Difficulty" value={interview.difficulty} />
                <StatCard title="Questions" value={answers.length.toString()} />
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Breakdown</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} />
                            <Radar
                                name="Score"
                                dataKey="score"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.6}
                            />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Scores per Question</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={answers}
                            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="question"
                                tickFormatter={(value) =>
                                    `Q${answers.findIndex((a) => a.question === value) + 1}`
                                }
                            />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="overallScore" fill="#8884d8" name="Overall" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Answers Details */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Answer Analysis</h2>
                <div className="space-y-6">
                    {answers.map((ans, index) => (
                        <div key={ans.id} className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">
                                Q{index + 1}: {ans.question}
                            </h3>
                            <p className="text-gray-700 mb-4 italic">Your answer: "{ans.answer}"</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
                                <StatCard
                                    title="Relevance"
                                    value={`${ans.relevanceScore || 0}/10`}
                                />
                                <StatCard title="Clarity" value={`${ans.clarityScore || 0}/10`} />
                                <StatCard title="Depth" value={`${ans.depthScore || 0}/10`} />
                            </div>
                            {ans.strengths && (
                                <div className="mb-2">
                                    <h4 className="font-semibold text-green-700">Strengths:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {ans.strengths.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {ans.improvements && (
                                <div>
                                    <h4 className="font-semibold text-orange-700">
                                        Areas for Improvement:
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                        {ans.improvements.map((imp, i) => (
                                            <li key={i}>{imp}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InterviewDetailPage;

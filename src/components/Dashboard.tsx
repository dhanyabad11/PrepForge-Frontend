'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define interfaces for our data structures
interface Interview {
  id: number;
  jobRole: string;
  company: string;
  createdAt: string;
  status: string;
  overallScore: number | null;
}

interface UserStats {
  totalInterviews: number;
  totalAnswers: number;
  averageRelevance: string;
  averageClarity: string;
  averageDepth: string;
  averageScore: number;
  behavioralSkill: number;
  technicalSkill: number;
  communicationSkill: number;
  currentStreak: number;
}

const StatCard = ({ title, value, unit }: { title: string; value: string | number; unit?: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
    <h3 className="text-md font-semibold text-gray-500">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">
      {value}
      {unit && <span className="text-lg font-medium text-gray-600 ml-1">{unit}</span>}
    </p>
  </div>
);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

      const [statsRes, interviewsRes] = await Promise.all([
        fetch(`${backendUrl}/api/user-stats/${userId}`),
        fetch(`${backendUrl}/api/interview-history/${userId}`),
      ]);

      if (!statsRes.ok || !interviewsRes.ok) {
        throw new Error('Failed to fetch user data.');
      }

      const statsData = await statsRes.json();
      const interviewsData = await interviewsRes.json();

      setStats(statsData.stats);
      setInterviews(interviewsData.interviews);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getUserIdAndFetchData = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
          const userRes = await fetch(`${backendUrl}/api/db/users/by-email/${session.user.email}`);
          if (!userRes.ok) {
            throw new Error('Failed to fetch user profile.');
          }
          const userData = await userRes.json();
          if (userData.success && userData.user) {
            fetchUserData(userData.user.id);
          } else {
            throw new Error(userData.message || 'Could not find user.');
          }
        } catch (err: any) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    getUserIdAndFetchData();
  }, [status, session, fetchUserData]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50 text-red-700">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p>{error}</p>
          <p>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">Please sign in to view your dashboard.</p>
        <Link href="/api/auth/signin" className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  const skillData = [
    { name: 'Behavioral', level: stats?.behavioralSkill || 0 },
    { name: 'Technical', level: stats?.technicalSkill || 0 },
    { name: 'Communication', level: stats?.communicationSkill || 0 },
  ];

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-sans">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Your Dashboard</h1>
        <p className="text-md text-gray-600 mt-1">Welcome back, {session?.user?.name || 'User'}!</p>
      </header>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
        <StatCard title="Total Interviews" value={stats?.totalInterviews ?? '0'} />
        <StatCard title="Avg. Score" value={stats?.averageScore?.toFixed(1) ?? '0.0'} />
        <StatCard title="Questions Answered" value={stats?.totalAnswers ?? '0'} />
        <StatCard title="Avg. Clarity" value={stats?.averageClarity ?? '0.0'} />
        <StatCard title="Current Streak" value={stats?.currentStreak ?? 0} unit="days" />
      </div>

      {/* Skills & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Levels */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Skill Levels</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="level" fill="#3b82f6" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Interview History */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Interview History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interviews.length > 0 ? (
                  interviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{interview.jobRole}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interview.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(interview.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          interview.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{interview.overallScore?.toFixed(1) ?? 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/interview/${interview.id}`} className="text-blue-600 hover:text-blue-800">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      You haven't completed any interviews yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
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

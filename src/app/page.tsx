"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import UserMenu from "@/components/UserMenu";

interface Question {
    id: string;
    question: string;
    type: "behavioral" | "technical" | "situational";
    difficulty: "easy" | "medium" | "hard";
    category: string;
}

export default function Home() {
    const { data: session } = useSession();
    const [jobRole, setJobRole] = useState("");
    const [company, setCompany] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentStep, setCurrentStep] = useState<"input" | "questions" | "mock" | "complete">(
        "input"
    );
    const [, setSavedQuestionSetId] = useState<string | null>(null);

    // Mock interview state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [followUpQuestion, setFollowUpQuestion] = useState("");
    const [isFetchingFollowUp, setIsFetchingFollowUp] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (currentStep === "mock" && !showFeedback) {
            const intervalId = setInterval(() => {
                setTimer((prevTimer) => prevTimer + 1);
            }, 1000);
            setTimerIntervalId(intervalId);

            return () => {
                if (intervalId) clearInterval(intervalId);
            };
        } else if (timerIntervalId) {
            clearInterval(timerIntervalId);
            setTimerIntervalId(null);
        }
    }, [currentStep, currentQuestionIndex, showFeedback, timerIntervalId]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    const handleGenerateQuestions = async () => {
        if (!jobRole.trim() || !company.trim()) {
            setError("Please fill both fields");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

            // First, register/update user if authenticated
            if (session?.user) {
                await fetch(`${backendUrl}/api/db/auth/user`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-email": session.user.email || "",
                        "x-user-name": session.user.name || "",
                        "x-user-image": session.user.image || "",
                    },
                    body: JSON.stringify({
                        email: session.user.email,
                        name: session.user.name,
                        image: session.user.image,
                        googleId: session.user.email, // Using email as googleId for now
                    }),
                });
            }

            // Generate questions with database integration if authenticated
            const endpoint = session?.user
                ? `${backendUrl}/api/db/generate-questions`
                : `${backendUrl}/api/generate-questions`;
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (session?.user) {
                headers["x-user-email"] = session.user.email || "";
                headers["x-user-name"] = session.user.name || "";
                headers["x-user-image"] = session.user.image || "";
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    jobRole,
                    company,
                    userId: session?.user?.email, // Use email as userId for now
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate questions");
            }

            const data = await response.json();
            setQuestions(data.questions || []);
            if (data.questionSetId) {
                setSavedQuestionSetId(data.questionSetId);
            }
            setCurrentStep("questions");
        } catch (err) {
            setError("Failed to generate questions. Please try again.");
            console.error("Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const startMockInterview = () => {
        setCurrentStep("mock");
        setCurrentQuestionIndex(0);
        setCurrentAnswer("");
        setFeedback("");
        setShowFeedback(false);
        setTimer(0);
    };

    const requestFollowUp = async () => {
        setIsFetchingFollowUp(true);
        setFollowUpQuestion("");
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
            const response = await fetch(`${backendUrl}/api/generate-follow-up`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    originalQuestion: questions[currentQuestionIndex]?.question,
                    answer: currentAnswer,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get follow-up question");
            }

            const data = await response.json();
            setFollowUpQuestion(data.followUpQuestion);
        } catch (err) {
            console.error("Error fetching follow-up:", err);
            setFollowUpQuestion(
                "Sorry, I couldn't generate a follow-up. Please proceed to the next question."
            );
        } finally {
            setIsFetchingFollowUp(false);
        }
    };

    const submitAnswer = async () => {
        if (!currentAnswer.trim()) {
            setError("Please provide an answer before submitting");
            return;
        }

        if (timerIntervalId) {
            clearInterval(timerIntervalId);
        }

        setIsSubmittingAnswer(true);
        setError("");

        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
            const response = await fetch(`${backendUrl}/api/generate-feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question: questions[currentQuestionIndex]?.question,
                    answer: currentAnswer,
                    timeSpent: timer, // Send time spent
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get feedback");
            }

            const data = await response.json();
            setFeedback(data.feedback || "Good response! Keep practicing to improve further.");
            setShowFeedback(true);
        } catch (err) {
            setError("Failed to get feedback. Please try again.");
            console.error("Error:", err);
        } finally {
            setIsSubmittingAnswer(false);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setCurrentAnswer("");
            setFeedback("");
            setShowFeedback(false);
            setFollowUpQuestion("");
            setError("");
            setTimer(0);
        } else {
            // Interview complete
            setCurrentStep("complete");
        }
    };

    const resetToHome = () => {
        setCurrentStep("input");
        setQuestions([]);
        setJobRole("");
        setCompany("");
        setError("");
        setCurrentQuestionIndex(0);
        setCurrentAnswer("");
        setFeedback("");
        setShowFeedback(false);
        setFollowUpQuestion("");
        setTimer(0);
    };

    return (
        <div style={{ background: "var(--background)" }}>
            {/* Top Navigation */}
            <div className="absolute top-0 right-0 p-6 z-10">
                <UserMenu />
            </div>

            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-4xl mx-auto">
                    {/* Input Screen */}
                    {currentStep === "input" && (
                        <div className="min-h-screen flex flex-col justify-center items-center px-4 animate-fadeIn">
                            {/* Header */}
                            <div className="text-center space-y-6 mb-12">
                                <h1
                                    className="text-6xl font-bold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    PrepForge
                                </h1>
                                <p
                                    className="text-xl font-light"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    Generate personalized questions and practice with AI feedback
                                </p>
                            </div>

                            {/* Input Form - Card with Pure White Background (60% rule) */}
                            <div className="card w-full max-w-lg">
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label
                                            className="block text-sm font-medium"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            Job Role
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Software Engineer"
                                            value={jobRole}
                                            onChange={(e) => setJobRole(e.target.value)}
                                            className="w-full text-lg bg-transparent border-0 border-b-2 px-0 py-3"
                                            style={{
                                                borderBottomColor: "var(--border)",
                                                color: "var(--foreground)",
                                            }}
                                            onFocus={(e) =>
                                                (e.target.style.borderBottomColor = "var(--accent)")
                                            }
                                            onBlur={(e) =>
                                                (e.target.style.borderBottomColor = "var(--border)")
                                            }
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label
                                            className="block text-sm font-medium"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Google"
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            className="w-full text-lg bg-transparent border-0 border-b-2 px-0 py-3"
                                            style={{
                                                borderBottomColor: "var(--border)",
                                                color: "var(--foreground)",
                                            }}
                                            onFocus={(e) =>
                                                (e.target.style.borderBottomColor = "var(--accent)")
                                            }
                                            onBlur={(e) =>
                                                (e.target.style.borderBottomColor = "var(--border)")
                                            }
                                        />
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            onClick={handleGenerateQuestions}
                                            disabled={
                                                isLoading || !jobRole.trim() || !company.trim()
                                            }
                                            className="btn-primary w-full text-lg py-4"
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center space-x-2">
                                                    <div className="loading-spinner"></div>
                                                    <span>Generating Questions...</span>
                                                </span>
                                            ) : (
                                                "Generate Questions"
                                            )}
                                        </button>
                                    </div>

                                    {error && (
                                        <p className="text-red-500 text-sm text-center transition-all duration-300">
                                            {error}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Questions Display Screen */}
                    {currentStep === "questions" && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="text-center">
                                <h2
                                    className="text-3xl font-light mb-12"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Your Interview Questions
                                </h2>
                            </div>

                            <div className="space-y-4 max-w-4xl mx-auto">
                                {questions.map((questionObj, index) => (
                                    <div key={questionObj.id || index} className="card">
                                        <div className="flex items-start space-x-4">
                                            <div
                                                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
                                                style={{ backgroundColor: "var(--accent)" }}
                                            >
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                        {questionObj.type}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                                        {questionObj.difficulty}
                                                    </span>
                                                </div>
                                                <p
                                                    className="text-lg leading-relaxed"
                                                    style={{ color: "var(--foreground)" }}
                                                >
                                                    {questionObj.question}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16">
                                <button onClick={resetToHome} className="btn-secondary px-8 py-3">
                                    Generate New Questions
                                </button>
                                <button
                                    onClick={startMockInterview}
                                    className="btn-primary px-8 py-3"
                                >
                                    Start Mock Interview
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mock Interview Mode */}
                    {currentStep === "mock" && (
                        <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
                            <div className="flex justify-between items-center">
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </p>
                                <div className="flex items-center gap-4">
                                    <p
                                        className="text-lg font-mono"
                                        style={{ color: "var(--accent)" }}
                                    >
                                        {formatTime(timer)}
                                    </p>
                                    <button
                                        onClick={resetToHome}
                                        className="text-sm hover:underline"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        End Mock
                                    </button>
                                </div>
                            </div>

                            <div className="card">
                                <div className="space-y-8">
                                    <div>
                                        <h3
                                            className="text-2xl font-light mb-8 leading-relaxed"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            <span
                                                className="font-medium"
                                                style={{ color: "var(--accent)" }}
                                            >
                                                Question {currentQuestionIndex + 1}:
                                            </span>
                                            <br />
                                            <br />
                                            {questions[currentQuestionIndex]?.question}
                                        </h3>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            value={currentAnswer}
                                            onChange={(e) => setCurrentAnswer(e.target.value)}
                                            placeholder="Type your answer here..."
                                            className="w-full min-h-[150px] p-0 border-0 border-b-2 text-base leading-relaxed resize-none"
                                            style={{
                                                backgroundColor: "transparent",
                                                borderBottomColor: "var(--border)",
                                                color: "var(--foreground)",
                                                outline: "none",
                                            }}
                                            onFocus={(e) =>
                                                (e.target.style.borderBottomColor = "var(--accent)")
                                            }
                                            onBlur={(e) =>
                                                (e.target.style.borderBottomColor = "var(--border)")
                                            }
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = "auto";
                                                target.style.height =
                                                    Math.max(150, target.scrollHeight) + "px";
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {!showFeedback ? (
                                <button
                                    onClick={submitAnswer}
                                    disabled={isSubmittingAnswer || !currentAnswer.trim()}
                                    className="btn-primary w-full py-4"
                                >
                                    {isSubmittingAnswer ? (
                                        <span className="flex items-center justify-center space-x-2">
                                            <div className="loading-spinner"></div>
                                            <span>Thinking...</span>
                                        </span>
                                    ) : (
                                        "Submit Answer"
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-6 animate-fadeIn">
                                    <div
                                        className="card"
                                        style={{ backgroundColor: "var(--muted)" }}
                                    >
                                        <h4
                                            className="font-medium mb-4 text-sm uppercase tracking-wide"
                                            style={{ color: "var(--text-secondary)" }}
                                        >
                                            AI Feedback:
                                        </h4>
                                        <p
                                            className="leading-relaxed text-base"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {feedback}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={requestFollowUp}
                                            disabled={isFetchingFollowUp}
                                            className="btn-secondary w-full py-4"
                                        >
                                            {isFetchingFollowUp
                                                ? "Getting Follow-up..."
                                                : "Request Follow-up"}
                                        </button>
                                        <button
                                            onClick={nextQuestion}
                                            className="btn-primary w-full py-4"
                                        >
                                            {currentQuestionIndex < questions.length - 1
                                                ? `Next Question →`
                                                : "Complete Interview ✓"}
                                        </button>
                                    </div>

                                    {followUpQuestion && (
                                        <div
                                            className="card animate-fadeIn"
                                            style={{ backgroundColor: "var(--muted)" }}
                                        >
                                            <h4
                                                className="font-medium mb-4 text-sm uppercase tracking-wide"
                                                style={{ color: "var(--text-secondary)" }}
                                            >
                                                Follow-up Question:
                                            </h4>
                                            <p
                                                className="leading-relaxed text-base"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                {followUpQuestion}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
                            )}
                        </div>
                    )}

                    {/* Interview Complete Screen */}
                    {currentStep === "complete" && (
                        <div className="text-center space-y-12 animate-fadeIn max-w-2xl mx-auto">
                            <div className="space-y-6">
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                                    style={{ backgroundColor: "var(--accent)" }}
                                >
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h2
                                    className="text-3xl font-light"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Mock Interview Complete! 🎉
                                </h2>
                                <p
                                    className="text-lg leading-relaxed"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    Great job! You&apos;ve successfully completed {questions.length}{" "}
                                    interview questions. Keep practicing to improve your interview
                                    skills.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <button
                                    onClick={resetToHome}
                                    className="btn-primary px-12 py-4 text-lg"
                                >
                                    Start New Interview
                                </button>

                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    Ready for another round of practice?
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

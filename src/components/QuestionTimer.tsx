"use client";

import { useEffect, useState } from "react";

interface QuestionTimerProps {
    duration: number; // seconds
    onTimeUp?: () => void;
    onTick?: (remaining: number) => void;
    autoStart?: boolean;
}

export default function QuestionTimer({
    duration,
    onTimeUp,
    onTick,
    autoStart = true,
}: QuestionTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(duration);
    const [isRunning, setIsRunning] = useState(autoStart);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!isRunning || isPaused) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev - 1;

                if (onTick) {
                    onTick(newTime);
                }

                if (newTime <= 0) {
                    setIsRunning(false);
                    if (onTimeUp) {
                        onTimeUp();
                    }
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, isPaused, onTick, onTimeUp]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getProgressPercentage = () => {
        return ((duration - timeRemaining) / duration) * 100;
    };

    const getColorClass = () => {
        const percentage = (timeRemaining / duration) * 100;
        if (percentage > 50) return "text-green-600 bg-green-100";
        if (percentage > 25) return "text-yellow-600 bg-yellow-100";
        return "text-red-600 bg-red-100";
    };

    const getProgressColor = () => {
        const percentage = (timeRemaining / duration) * 100;
        if (percentage > 50) return "bg-green-600";
        if (percentage > 25) return "bg-yellow-600";
        return "bg-red-600";
    };

    const handlePlayPause = () => {
        if (!isRunning && timeRemaining === 0) {
            // Reset and start
            setTimeRemaining(duration);
            setIsRunning(true);
            setIsPaused(false);
        } else {
            setIsPaused(!isPaused);
        }
    };

    const handleReset = () => {
        setTimeRemaining(duration);
        setIsRunning(false);
        setIsPaused(false);
    };

    return (
        <div className="w-full">
            {/* Timer Display */}
            <div className="flex items-center justify-between mb-4">
                <div
                    className={`px-6 py-3 rounded-lg font-mono text-3xl font-bold ${getColorClass()}`}
                >
                    {formatTime(timeRemaining)}
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                    <button
                        onClick={handlePlayPause}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        {!isRunning || isPaused ? "▶️ Start" : "⏸️ Pause"}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all ${getProgressColor()}`}
                    style={{ width: `${getProgressPercentage()}%` }}
                ></div>
            </div>

            {/* Time Info */}
            <div className="mt-2 text-sm text-gray-600 text-center">
                {timeRemaining === 0 ? "⏰ Time's up!" : `${formatTime(timeRemaining)} remaining`}
            </div>
        </div>
    );
}

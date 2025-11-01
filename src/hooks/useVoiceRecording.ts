import { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";

interface UseVoiceRecordingOptions {
    onRecordingComplete?: (blob: Blob, duration: number) => void;
    maxDuration?: number; // in seconds
}

export function useVoiceRecording(options: UseVoiceRecordingOptions = {}) {
    const { onRecordingComplete, maxDuration = 300 } = options; // 5 min default

    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioURL, setAudioURL] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedTimeRef = useRef<number>(0);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });

            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);

                if (onRecordingComplete) {
                    onRecordingComplete(blob, recordingTime);
                }

                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();

            startTimeRef.current = Date.now();
            setIsRecording(true);
            setIsPaused(false);

            // Start timer
            timerRef.current = setInterval(() => {
                const elapsed = Math.floor(
                    (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000
                );
                setRecordingTime(elapsed);

                // Auto-stop at max duration
                if (elapsed >= maxDuration) {
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                        mediaRecorderRef.current.stop();
                        setIsRecording(false);
                        setIsPaused(false);
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                        }
                    }
                    toast.error(`Maximum recording duration (${maxDuration}s) reached`);
                }
            }, 100);

            toast.success("Recording started");
        } catch (error) {
            console.error("Error starting recording:", error);
            toast.error("Failed to access microphone. Please grant permission.");
        }
    }, [maxDuration, onRecordingComplete, recordingTime]);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            pausedTimeRef.current = Date.now() - startTimeRef.current;
            toast("Recording paused");
        }
    }, [isRecording, isPaused]);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            startTimeRef.current = Date.now() - pausedTimeRef.current;
            toast("Recording resumed");
        }
    }, [isRecording, isPaused]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            toast.success(`Recording completed (${formatTime(recordingTime)})`);
        }
    }, [isRecording, recordingTime]);

    const resetRecording = useCallback(() => {
        if (audioURL) {
            URL.revokeObjectURL(audioURL);
        }
        setAudioURL(null);
        setRecordingTime(0);
        pausedTimeRef.current = 0;
        chunksRef.current = [];
    }, [audioURL]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return {
        isRecording,
        isPaused,
        recordingTime,
        audioURL,
        formattedTime: formatTime(recordingTime),
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        resetRecording,
    };
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { question, answer } = await request.json();

        if (!question || !answer) {
            return NextResponse.json(
                { error: "Question and answer are required" },
                { status: 400 }
            );
        }

        // Call the backend API - use NEXT_PUBLIC_API_URL for production
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://localhost:5000";
        const response = await fetch(`${backendUrl}/api/generate-feedback`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question, answer }),
        });

        if (!response.ok) {
            throw new Error("Backend API call failed");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error generating feedback:", error);
        return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
    }
}

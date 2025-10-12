import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { jobRole, company, experience, difficulty, numberOfQuestions, questionType } = await request.json();

        if (!jobRole || !company) {
            return NextResponse.json(
                { error: "Job role and company are required" },
                { status: 400 }
            );
        }

        // Get session to extract userId
        const session = await getServerSession(authOptions);
        const userId = session?.user?.email || "anonymous";

        // Call the backend API
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://localhost:5000";
        const response = await fetch(`${backendUrl}/api/generate-questions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                jobRole, 
                company, 
                userId,
                experience: experience || "mid-level",
                difficulty: difficulty || "medium",
                numberOfQuestions: numberOfQuestions || 5,
                questionType: questionType || "all"
            }),
        });

        if (!response.ok) {
            throw new Error("Backend API call failed");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error generating questions:", error);
        return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
    }
}



import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { app } from "../../config/Firebase";


// Initialize Gemini AI
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

// Async function to generate content
export const AiCheck = async (prompt) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
};

export const AiHint = async (question, response) => {
    const prompt = `You are an AI tutor helping a student with AI training material. The student has answered a question, but their response is not fully correct or complete.
Here is the question:
"${question}"
Here is the student's current response:
"${response}
Give the student a gentle and helpful hint to guide them toward a better understanding. Do NOT give a full answer. Focus on what might be missing, unclear, or misunderstood. But do not provide the full answer or solution.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
}
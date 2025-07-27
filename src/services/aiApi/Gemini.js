

// import { GoogleGenAI } from "@google/genai";
// const ai = new GoogleGenAI({ apiKey: "AIzaSyB479jrbJz62aFn6-Yk3kpv_M-O0afIfWc" });

// export const GeminiCheckReason = async (text) => {
//     const prompt = `Please classify this: "${text}" as very positive, neutral, negative.`;

//     const response = await ai.models.generateContent({
//         model: "gemini-2.0-flash",
//         contents: prompt,
//     });
//     return response.text.trim();
// }

import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { app } from "../../config/Firebase";  // reuse your firebaseApp

// Initialize Gemini AI
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

// Async function to generate content
export const AiCheck = async (prompt) => {

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return null;
    }
};

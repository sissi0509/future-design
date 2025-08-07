/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */



// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
import { setGlobalOptions } from "firebase-functions/v2";
setGlobalOptions({ maxInstances: 10 });


import { onCall } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";


// Initialize Gemini with API key (replace with your real key!)
const gemini = new GoogleGenAI({ apiKey: "AIzaSyB479jrbJz62aFn6-Yk3kpv_M-O0afIfWc" });

// Define and export the sentiment function
export const getSentiment = onCall(async (request) => {
    const userText = request.data.text;

    const prompt = `Please classify this: "${userText}" as very happy, happy, neutral, sad, or very sad.`;

    try {
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const sentiment = response.text;
        return { sentiment };
    } catch (error) {
        console.error("Gemini error:", error.message);
        throw new Error('Failed to generate sentiment');
    }
});




// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

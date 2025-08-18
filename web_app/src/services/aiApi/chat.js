import { model } from "./simpleGemini";

// our app messages: { role: "you" | "ai", text: string }
function toGeminiHistory(history = []) {
    return history.map((m) => ({
        role: m.role === "you" ? "user" : "model",
        parts: [{ text: m.text ?? "" }],
    }));
}

export function createChatSession(history = []) {
    const geminiHistory = toGeminiHistory(history);

    let chat;
    let usedFallback = false;
    let readyResolve;
    const readyPromise = new Promise((r) => (readyResolve = r));

    try {
        chat = model.startChat(geminiHistory.length ? { history: geminiHistory } : {});
        readyResolve(); // immediately ready
    } catch {
        // Fallback: start empty and manually prime BOTH roles (User + Assistant)
        chat = model.startChat();
        usedFallback = true;

        (async () => {
            try {
                if (Array.isArray(history) && history.length) {
                    const transcript = history
                        .map((m) => (m.role === "you" ? `User: ${m.text}` : `Assistant: ${m.text}`))
                        .join("\n");

                    if (transcript.trim()) {
                        // Send a primer message to the AI
                        await chat.sendMessage(
                            `You are resuming a conversation.\nTranscript so far:\n${transcript}\n(End transcript)\nReply "OK".`
                        );
                    }
                }
            } finally {
                readyResolve(); // mark ready even if primer fails
            }
        })();
    }

    return {
        async send(userText) {
            await readyPromise; // ensure primer finished
            const res = await chat.sendMessage(userText);
            return res.response.text();
        },
        ready: () => readyPromise,
    };
}

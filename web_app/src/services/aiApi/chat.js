import { model } from './simpleGemini'


// One session = multi-turn memory. Reuse this per ChatBox instance.
export function createChatSession() {
    const chat = model.startChat(); // no history passed; session remembers turns
    return {
        async send(userText) {
            const res = await chat.sendMessage(userText);
            // SDKs return slightly different shapes; guard both:
            if (res?.response?.text) return res.response.text();
            if (typeof res?.text === "function") return res.text();
            return ""; // fallback
        },
        // Optional streaming usage:
        async stream(userText, onToken) {
            const stream = await chat.sendMessageStream(userText);
            for await (const chunk of stream.stream) {
                onToken(chunk.text());
            }
        },
    };
}

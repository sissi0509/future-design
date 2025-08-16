// ChatBoxAI.jsx
import { useEffect, useState, useRef } from "react";
import { useAnswersRegistry } from "../../context/AnswersRegistry";
import { getCoachPrompt } from "../../data/questions/training/aiCoachPrompts";
import { insertTextAt, SpeechToTextButton } from '../SpeechToText'; // ensure SpeechToText is bundled
import { createChatSession } from "../../services/aiApi/chat";


export default function ChatBoxAI({
    title = "AI Coach",
    registryKey = "trainingAiConversation",
    uid,
    group,
    maxMessagesToSave = 200,
}) {
    const storageKey = `chat-${registryKey}-${uid}-g${group}`;
    const { set: regSet, remove: regRemove } = useAnswersRegistry();
    const textareaRef = useRef(null);
    const chatRef = useRef(null);

    // opener computed once per mount
    const opener = { role: "ai", text: getCoachPrompt(group)?.trim() || "Hi! Ask me anything as you work." };

    const loadFromLocal = () => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) return JSON.parse(raw);
        } catch { }
        return null;
    };

    // init synchronously -> no loading/null state
    const [messages, setMessages] = useState(() => loadFromLocal() ?? [opener]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    // Create the session once on mount
    useEffect(() => {
        chatRef.current = createChatSession();
    }, []);


    // persist locally
    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify(messages)); } catch { }
    }, [storageKey, messages]);

    // register for logout flush
    useEffect(() => {
        const meaningful = Array.isArray(messages) && messages.length > 2;

        if (!meaningful) { regRemove(registryKey); return; }

        regSet(registryKey, {
            type: registryKey,
            answers: { group, messages: messages.slice(-maxMessagesToSave) },
        });
    }, [messages, group, regSet, regRemove, registryKey, maxMessagesToSave]);

    const send = async (e) => {
        e.preventDefault();
        const t = input.trim();
        if (!t || !chatRef.current) return;

        // append user
        setMessages((m) => [...m, { role: "you", text: t }]);
        setInput("");

        // ask the model using the same session
        setIsThinking(true);
        try {
            const reply = await chatRef.current.send(t);
            // append model reply
            setMessages((m) => [...m, { role: "ai", text: reply || "(no response)" }]);
        } catch (err) {
            setMessages((m) => [...m, { role: "ai", text: "Oops—something went wrong. Please try again." }]);
            console.warn("chat error:", err);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="h-full flex flex-col border rounded-xl overflow-hidden">
            <div className="px-4 py-3 font-semibold bg-base-200">{title}</div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "you" ? "justify-end" : "justify-start"}`}>
                        <div className={`inline-block px-3 py-2 rounded-lg ${m.role === "you" ? "bg-primary text-white" : "bg-base-300"}`}>
                            {m.text}
                        </div>
                    </div>
                ))}


                {isThinking && (
                    <div className="text-left">
                        <div className="inline-block px-3 py-2 rounded-lg bg-base-300 opacity-70">
                            thinking…
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={send} className="px-3 pt-3 pb-6 border-t bg-base-100">
                <div className="relative">
                    <textarea
                        value={input}
                        ref={textareaRef}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message…"
                        rows={5}
                        className="textarea textarea-bordered w-full rounded-lg text-base pr-28"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send(e);
                            }
                        }}
                    />
                    <div className="absolute right-2 bottom-2 flex gap-2">
                        <SpeechToTextButton
                            onResult={(spoken) => {
                                const ta = textareaRef.current;
                                if (!ta) return;
                                insertTextAt(ta, ta.value, spoken, setInput);
                            }}
                        />

                        {/* <button className="btn btn-primary absolute right-2 bottom-2 px-4 py-2 text-sm" type="submit">
                            Send
                        </button> */}
                    </div>
                </div>
            </form>
        </div>
    );
}

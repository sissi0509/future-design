import { useEffect, useState } from "react";

export default function ChatBoxAI({
    title = "AI Coach",
    chatKey = "default",   // e.g., "trainingRevision"
    uid,                   // currentUser?.uid (optional but recommended)
    group,                 // number or string; used in storage key
    firstMessage = "Hi! Ask me anything as you work.",
}) {
    // per-user + per-group storage key to avoid wrong opener
    const storageKey = `chat-${chatKey}-${uid ?? "anon"}-g${group ?? 0}`;

    // load once (or seed)
    const [messages, setMessages] = useState(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) return JSON.parse(raw);
        } catch { }
        return [{ role: "ai", text: (firstMessage || "").trim() || "Hi! Ask me anything as you work." }];
    });

    const [input, setInput] = useState("");

    // re-load or re-seed whenever the key (or opener) changes
    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                setMessages(JSON.parse(raw));
            } else {
                setMessages([{ role: "ai", text: (firstMessage || "").trim() || "Hi! Ask me anything as you work." }]);
            }
        } catch { }
    }, [storageKey, firstMessage]);

    // persist on every change
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } catch { }
    }, [storageKey, messages]);

    const send = (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;
        setMessages((m) => [...m, { role: "you", text: trimmed }]);
        setInput("");
        // (optional) stub AI reply:
        // setMessages((m) => [...m, { role: "ai", text: "Thanks — noted." }]);
    };

    return (
        <div className="h-full flex flex-col border rounded-xl overflow-hidden">
            <div className="px-4 py-3 font-semibold bg-base-200">{title}</div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((m, i) => (
                    <div key={i} className={m.role === "you" ? "text-right" : "text-left"}>
                        <div className={`inline-block px-3 py-2 rounded-lg ${m.role === "you" ? "bg-primary text-white" : "bg-base-300"}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={send} className="px-3 pt-3 pb-6 border-t bg-base-100">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message…"
                        rows={3}
                        className="textarea textarea-bordered w-full rounded-lg text-base"
                    />
                    <button className="btn btn-primary absolute right-2 bottom-2 px-4 py-2 text-sm" type="submit">
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

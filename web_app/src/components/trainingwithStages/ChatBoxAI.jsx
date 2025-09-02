import { useState } from "react";

export default function ChatBoxAI({ title = "AI Coach" }) {
    const [messages, setMessages] = useState([
        { role: "ai", text: "Hi! Ask me anything as you work." },
    ]);
    const [input, setInput] = useState("");

    const send = (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;
        setMessages((m) => [...m, { role: "you", text: trimmed }]);
        setInput("");

        // TODO: replace with real AI call
        setTimeout(() => {
            setMessages((m) => [
                ...m,
                {
                    role: "ai",
                    text: "Thanks—try to identify evidence supporting your point.",
                },
            ]);
        }, 400);
    };

    return (
        <div className="h-full flex flex-col border rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-base-200 flex items-center gap-2">

                <h2 className="font-semibold flex-1 min-w-0 truncate">{title}</h2>

                <button
                    type="button"
                    className="btn btn-sm btn-primary ml-auto"
                    onClick={onStartNew} // pass this prop in
                >
                    Start New
                </button>
            </div>


            {/* Chat messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={m.role === "you" ? "text-right" : "text-left"}
                    >
                        <div
                            className={`inline-block px-3 py-2 rounded-lg ${m.role === "you"
                                ? "bg-primary text-white"
                                : "bg-base-300"
                                }`}
                        >
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input area */}
            <form
                onSubmit={send}
                className="px-3 pt-3 pb-6 border-t bg-base-100"
            >
                <div className="relative flex-1">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message…"
                        rows={3}
                        className="textarea textarea-bordered w-full rounded-lg text-base "
                    />
                    <button
                        className="btn btn-primary absolute right-2 bottom-2 px-4 py-2 text-sm"
                        type="submit"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

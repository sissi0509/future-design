import { useRef, useState } from "react";
import { getCoachPrompt } from "../../data/questions/training/aiCoachPrompts";
import { insertTextAt, SpeechToTextButton } from "../SpeechToText";
import { useChatStore } from "./chatboxSetup/useChatStore";

export default function ChatBoxAI({
    title = "AI Coach",
    registryKey = "trainingAiConversation",
    uid,
    group,
    maxMessagesToSave = 200,
}) {
    const storageKey = `chat-${registryKey}-${uid}-g${group}-branches`;
    const textareaRef = useRef(null);

    const [opener] = useState(() => ({
        role: "ai",
        text: getCoachPrompt(group)?.trim() || "Hi! Ask me anything as you work.",
    }));

    const {
        state: { branches, activeId, messages, input, isThinking, editingIndex, editDraft },
        actions: {
            setInput,
            send,
            startEdit,
            cancelEdit,
            setEditDraft,
            saveEditAndResend_NewBranch,
            switchBranch,
            optionsForMessage,
        },
    } = useChatStore({
        storageKey,
        opener,
        registryKey,
        group,
        maxMessagesToSave,
    });

    return (
        <div className="h-full flex flex-col border rounded-xl overflow-hidden">
            <div className="px-4 py-3 font-semibold bg-base-200 flex items-center gap-2">
                <span>{title}</span>
                <div className="ml-auto" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((m, i) => {
                    const isYou = m.role === "you";
                    const isEditing = editingIndex === i;

                    const { options, activeOptionIdx } = optionsForMessage(i, activeId);

                    return (
                        <div key={i} className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
                            <div className={isEditing ? "group relative block w-full" : "group relative inline-block max-w-[85%]"}>
                                <div
                                    className={`px-3 py-2 rounded-lg whitespace-pre-wrap break-words ${isEditing
                                        ? "bg-base-100 text-base-content ring-2 ring-warning"
                                        : isYou
                                            ? "bg-primary text-white"
                                            : "bg-base-300"
                                        }`}
                                >
                                    {!isEditing ? (
                                        m.text
                                    ) : (
                                        <div>
                                            <textarea
                                                className="textarea w-full md:w-[48rem] max-w-full min-h-[8rem] resize-y bg-base-100 text-base-content"
                                                value={editDraft}
                                                onChange={(e) => setEditDraft(e.target.value)}
                                                // onKeyDown={(e) => {
                                                //     if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEditAndResend_NewBranch(); }
                                                //     if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
                                                // }}
                                                autoFocus
                                            />
                                            <div className="mt-3 flex justify-end gap-2">
                                                <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>
                                                <button type="button" className="btn btn-neutral" onClick={saveEditAndResend_NewBranch}>Send</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!isEditing && (
                                    <div
                                        className={[
                                            "mt-1 flex items-center gap-2 text-xs text-base-content/60",
                                            isYou ? "justify-end pr-1" : "justify-start pl-1",
                                            "max-w-[85%] opacity-0 group-hover:opacity-100 transition-opacity",
                                        ].join(" ")}
                                    >
                                        {/* Edit (only for your messages) */}
                                        {isYou && (
                                            <button
                                                type="button"
                                                title="Edit & re-ask (creates a new branch)"
                                                onClick={() => startEdit(i)}
                                                className="btn btn-ghost btn-xs"
                                            >
                                                ✏️ Edit
                                            </button>
                                        )}

                                        {/* Numeric branch options: 1..N */}
                                        {options.length > 1 && (
                                            <div className="flex items-center gap-1">
                                                {options.map((id, idx) => (
                                                    <button
                                                        key={id}
                                                        type="button"
                                                        onClick={() => switchBranch(id)}
                                                        className={`btn btn-xs ${idx === activeOptionIdx ? "btn-primary" : "btn-outline"}`}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}


                            </div>
                        </div>
                    );
                })}

                {isThinking && (
                    <div className="text-left">
                        <div className="inline-block px-3 py-2 rounded-lg bg-base-300 opacity-70">thinking…</div>
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
                    </div>
                </div>
            </form>
        </div>
    );
}

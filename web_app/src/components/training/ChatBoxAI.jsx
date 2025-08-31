import { useRef } from "react";
import { insertTextAt, SpeechToTextButton } from "../SpeechToText";
import { useChatStore } from "./chatboxSetup/useChatStore";
// import StarterPanel from "./chatboxSetup/StarterPanel";
import ChatBubbles from "./chatboxSetup/ChatBubbles";
import { STARTER_BUBBLES, STARTER_INTRO, buildInstructionPrompt } from "../../data/questions/training/aiPrompts";


export default function ChatBoxAI({
    title = "AI Coach",
    storageKey,
    maxMessagesToSave = 200,
    onKeyDown = () => { },
    logClick = () => { },
    logSystemGenerated = () => { },
    onScroll = () => { },
}) {
    const textareaRef = useRef(null);

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
        opener: { role: "ai", text: STARTER_INTRO },
        systemPrompt: buildInstructionPrompt(),
        maxMessagesToSave,
        logSystemGenerated,
    });

    // render a single message row (same UI you already have)
    const renderMessage = (m, i) => {
        const isYou = m.role === "you";
        const isEditing = editingIndex === i;
        const { options, activeOptionIdx } = optionsForMessage(i, activeId);

        return (
            <div key={i} className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
                <div className={isEditing ? "group relative block w-full" : "group relative inline-block max-w-[85%]"}>
                    <div
                        className={[
                            "px-3 py-2 rounded-lg whitespace-pre-wrap break-words",
                            isEditing
                                ? "bg-base-100 text-base-content ring-2 ring-warning"
                                : isYou
                                    ? "bg-primary text-white"
                                    : "bg-base-300",
                        ].join(" ")}
                    >
                        {!isEditing ? (
                            m.text
                        ) : (
                            <div>
                                <textarea
                                    className="textarea w-full md:w-[48rem] max-w-full min-h-[8rem] resize-y bg-base-100 text-base-content"
                                    value={editDraft}
                                    onChange={(e) => setEditDraft(e.target.value)}
                                    onKeyDown={onKeyDown}
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
    };


    return (
        <div className="h-full flex flex-col border rounded-xl overflow-hidden" onScroll={onScroll}>
            <div className="px-4 py-3 font-semibold bg-base-200 flex items-center gap-2">
                <span>{title}</span>
                <div className="ml-auto" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages[0] && renderMessage(messages[0], 0)}

                {messages[0]?.role === "ai" && (
                    <div className="mt-3 mb-1 flex justify-end">

                        <ChatBubbles
                            starters={STARTER_BUBBLES}
                            disabled={isThinking}
                            onPick={(text) => {
                                try { logClick("btn-bubble-pick", text); } catch { }
                                send(text);
                            }}
                        />

                    </div>
                )}

                {messages.slice(1).map((m, j) => renderMessage(m, j + 1))}

                {isThinking && (
                    <div className="text-left">
                        <div className="inline-block px-3 py-2 rounded-lg bg-base-300 opacity-70">thinking…</div>
                    </div>
                )}
            </div>

            <form
                onSubmit={(e) => {
                    logClick("btn-send", "Send");
                    send(e);
                }}
                className="px-3 pt-3 pb-6 border-t bg-base-100"
            >
                <div className="relative">
                    <textarea
                        value={input}
                        ref={textareaRef}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message…"
                        rows={5}
                        className="textarea textarea-bordered w-full rounded-lg text-base pr-28"
                        onKeyDown={(e) => {
                            onKeyDown(e);
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                logClick("btn-send", "Send(Enter)");
                                send(e);
                            }
                        }}
                        disabled={isThinking}
                    />
                    <div className="absolute right-2 bottom-2 flex gap-2">
                        <SpeechToTextButton
                            onClick={logClick}
                            logSystemGenerated={logSystemGenerated}
                            onResult={(spoken) => {
                                const ta = textareaRef.current;
                                if (!ta) return;
                                insertTextAt(ta, ta.value, spoken, setInput);
                            }}
                        />
                    </div>
                </div>

                <p className="mt-1 text-center text-base-content/60">
                    AI can make mistakes, so double-check it.
                </p>
            </form>
        </div>
    );
}

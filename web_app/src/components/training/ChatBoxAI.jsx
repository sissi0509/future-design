// ChatBoxAI.jsx — ChatGPT-style inline edit with Send/Cancel (no visible branch pills)
// - Edit button bottom-right, outside the bubble
// - Press Enter to "Save & re-ask as NEW BRANCH" (no toolbar)
// - Press Esc to cancel editing
// - Under the forked message, show numbered options 1..N (parent = 1, children = 2,3,...)
// - LocalStorage with versioning + legacy normalization
// - AnswersRegistry export (capped)
// - Race-condition safe updates

import { useEffect, useMemo, useRef, useState } from "react";
import { useAnswersRegistry } from "../../context/AnswersRegistry";
import { getCoachPrompt } from "../../data/questions/training/aiCoachPrompts";
import { insertTextAt, SpeechToTextButton } from "../SpeechToText";
import { createChatSession } from "../../services/aiApi/chat";

const CHAT_STORAGE_VERSION = 5; // bump when schema changes

// ----------------------------------------
// Utilities
// ----------------------------------------
function uidLike() { return Math.random().toString(36).slice(2, 10); }

function coerceMessage(msg, idx, openerText) {
    if (msg && typeof msg === "object" && typeof msg.text === "string" && (msg.role === "you" || msg.role === "ai")) return msg;
    const text = typeof msg === "string" ? msg : (msg && (msg.text || msg.content)) || "";
    if (msg && typeof msg === "object" && typeof msg.sender === "string") {
        const s = msg.sender.toLowerCase();
        if (s === "user" || s === "you") return { role: "you", text };
        if (s === "assistant" || s === "ai" || s === "model") return { role: "ai", text };
    }
    if (idx === 0 || text === openerText) return { role: "ai", text };
    return { role: idx % 2 === 1 ? "you" : "ai", text };
}

function normalizeBranchesData(parsed, openerText) {
    if (!parsed) return null;
    if (Array.isArray(parsed.messages)) {
        const msgs = parsed.messages.map((m, i) => coerceMessage(m, i, openerText));
        const b0 = { id: uidLike(), title: "Main", createdAt: Date.now(), messages: msgs };
        return { branches: [b0], activeId: b0.id, formatVersion: CHAT_STORAGE_VERSION };
    }
    if (!Array.isArray(parsed.branches)) return null;
    const branches = parsed.branches.map((b) => ({
        id: b.id || uidLike(),
        title: b.title || "Main",
        createdAt: b.createdAt || Date.now(),
        messages: Array.isArray(b.messages) ? b.messages.map((m, i) => coerceMessage(m, i, openerText)) : [{ role: "ai", text: openerText }],
        parentId: b.parentId,
        forkedFromIndex: typeof b.forkedFromIndex === "number" ? b.forkedFromIndex : undefined,
    }));
    const activeId = parsed.activeId && branches.find((b) => b.id === parsed.activeId) ? parsed.activeId : branches[0].id;
    return { branches, activeId, formatVersion: CHAT_STORAGE_VERSION };
}

function shortTime(ts) { try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } }

// ----------------------------------------
// Component
// ----------------------------------------
export default function ChatBoxAI({
    title = "AI Coach",
    registryKey = "trainingAiConversation",
    uid,
    group,
    maxMessagesToSave = 200,
    replayHistoryOnResend = true,
}) {
    const storageKey = `chat-${registryKey}-${uid}-g${group}-branches`;
    const { set: regSet, remove: regRemove } = useAnswersRegistry();
    const textareaRef = useRef(null);
    const chatRef = useRef(null);

    const opener = useMemo(
        () => ({ role: "ai", text: getCoachPrompt(group)?.trim() || "Hi! Ask me anything as you work." }),
        [group]
    );

    // ---- load/save with versioning + normalization
    const loadFromLocal = () => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.formatVersion === CHAT_STORAGE_VERSION && Array.isArray(parsed?.branches) && parsed?.activeId) {
                    return parsed;
                }
                const normalized = normalizeBranchesData(parsed, opener.text);
                if (normalized) {
                    try { localStorage.setItem(storageKey, JSON.stringify(normalized)); } catch { }
                    return normalized;
                }
            }
        } catch { }
        return null;
    };

    const seed = useMemo(() => {
        const loaded = loadFromLocal();
        if (loaded) return loaded;
        const b0 = { id: uidLike(), title: "Main", messages: [opener], createdAt: Date.now() };
        return { branches: [b0], activeId: b0.id, formatVersion: CHAT_STORAGE_VERSION };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [branches, setBranches] = useState(seed.branches);
    const [activeId, setActiveId] = useState(seed.activeId);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    // Inline edit state
    const [editingIndex, setEditingIndex] = useState(null);
    const [editDraft, setEditDraft] = useState("");

    const activeBranch = useMemo(() => (branches.find((b) => b.id === activeId) || branches[0]), [branches, activeId]);
    const messages = activeBranch?.messages ?? [];

    // Chat session
    useEffect(() => { chatRef.current = createChatSession(); }, []);

    // Prime fresh session with coach prompt only (stable)
    const primeSession = async () => {
        if (!chatRef.current) return;
        if (opener?.text) {
            try {
                await chatRef.current.send(`[SYSTEM]
${opener.text}`);
            } catch { }
        }
    };

    useEffect(() => {
        if (!chatRef.current) return;
        const onceKey = storageKey + ":primed";
        if (sessionStorage.getItem(onceKey)) return;
        (async () => { try { await primeSession(); } finally { sessionStorage.setItem(onceKey, "1"); } })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opener]);

    // Persist helper
    const persist = (nextBranches, nextActiveId = activeId) => {
        setBranches(nextBranches);
        setActiveId(nextActiveId);
        try { localStorage.setItem(storageKey, JSON.stringify({ branches: nextBranches, activeId: nextActiveId, formatVersion: CHAT_STORAGE_VERSION })); } catch { }
    };

    // Race-safe message updates
    const updateBranchMessages = (branchId, updater, persistActiveIdOverride) => {
        setBranches((prev) => {
            const next = prev.map((b) => (b.id === branchId ? { ...b, messages: updater(b.messages) } : b));
            try { localStorage.setItem(storageKey, JSON.stringify({ branches: next, activeId: persistActiveIdOverride ?? activeId, formatVersion: CHAT_STORAGE_VERSION })); } catch { }
            return next;
        });
        if (persistActiveIdOverride != null) setActiveId(persistActiveIdOverride);
    };

    const setActiveMessages = (updater) => { updateBranchMessages(activeId, updater); };

    // ---- sending
    const send = async (e) => {
        e?.preventDefault?.();
        const t = (typeof e === "string" ? e : input).trim();
        if (!t || !chatRef.current) return;
        setActiveMessages((m) => [...m, { role: "you", text: t }]);
        if (typeof e !== "string") setInput("");
        setIsThinking(true);
        try {
            const reply = await chatRef.current.send(t);
            setActiveMessages((m) => [...m, { role: "ai", text: reply || "(no response)" }]);
        } catch (err) {
            setActiveMessages((m) => [...m, { role: "ai", text: "Oops—something went wrong. Please try again." }]);
            console.warn("chat error:", err);
        } finally { setIsThinking(false); }
    };

    // ---- editing → ALWAYS new branch on re-ask
    const startEdit = (idx) => {
        const msg = messages[idx];
        if (!msg || msg.role !== "you") return;
        setEditingIndex(idx);
        setEditDraft(msg.text);
    };
    const cancelEdit = () => { setEditingIndex(null); setEditDraft(""); };

    const saveEditAndResend_NewBranch = async () => {
        if (editingIndex == null) return;
        const editedText = editDraft.trim();
        if (!editedText) return;

        const base = messages.slice(0, editingIndex + 1).map((m, i) => (i === editingIndex ? { ...m, text: editedText } : m));
        const forkParentId = (activeBranch.parentId && activeBranch.forkedFromIndex === editingIndex) ? activeBranch.parentId : activeId;
        const newBranch = { id: uidLike(), title: `Fork ${shortTime(Date.now())}`, messages: base, createdAt: Date.now(), parentId: forkParentId, forkedFromIndex: editingIndex };

        const nextBranches = [...branches, newBranch];
        persist(nextBranches, newBranch.id);

        cancelEdit();
        setIsThinking(true);

        try {
            chatRef.current = createChatSession();
            await primeSession();
            const reply = await chatRef.current.send(editedText);
            const appended = nextBranches.map((b) => b.id === newBranch.id ? { ...b, messages: [...(b.messages || []), { role: "ai", text: reply || "(no response)" }] } : b);
            persist(appended, newBranch.id);
        } catch (err) {
            setActiveMessages((m) => [...m, { role: "ai", text: "(edit) We couldn't refresh from here. Please try again." }]);
            console.warn("fork+resend error:", err);
        } finally { setIsThinking(false); }
    };

    // ---- branch switch
    const switchBranch = async (id) => {
        setActiveId(id);
        try { localStorage.setItem(storageKey, JSON.stringify({ branches, activeId: id, formatVersion: CHAT_STORAGE_VERSION })); } catch { }
        chatRef.current = createChatSession();
        await primeSession();
    };

    // Registry export (cap messages per branch)
    useEffect(() => {
        const anyMeaningful = branches.some((b) => (b.messages?.length || 0) > 1);
        if (!anyMeaningful) { regRemove(registryKey); return; }
        regSet(registryKey, { type: registryKey, answers: { group, activeBranch: activeId, branches: branches.map((b) => ({ id: b.id, title: b.title, parentId: b.parentId, forkedFromIndex: b.forkedFromIndex, messages: (b.messages || []).slice(-maxMessagesToSave) })) } });
    }, [branches, activeId, group, maxMessagesToSave, regSet, regRemove, registryKey]);

    // ----------------------------------------
    // UI
    // ----------------------------------------
    return (
        <div className="h-full flex flex-col border rounded-xl overflow-hidden">
            {/* Header (minimal) */}
            <div className="px-4 py-3 font-semibold bg-base-200 flex items-center gap-2">
                <span>{title}</span>
                <div className="ml-auto" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((m, i) => {
                    const isYou = m.role === "you";
                    const isEditing = editingIndex === i;

                    const anchorParentId = (activeBranch.parentId && activeBranch.forkedFromIndex === i) ? activeBranch.parentId : activeId;
                    const siblings = branches.filter((br) => br.parentId === anchorParentId && br.forkedFromIndex === i).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
                    const options = [anchorParentId, ...siblings.map((b) => b.id)];
                    const activeOptionIdx = options.findIndex((id) => id === activeId);

                    return (
                        <div key={i} className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
                            <div className={isEditing ? "group relative block w-full" : "group relative inline-block max-w-[85%]"}>
                                <div className={`px-3 py-2 rounded-lg whitespace-pre-wrap break-words ${isEditing ? "bg-base-100 text-base-content ring-2 ring-warning" : isYou ? "bg-primary text-white" : "bg-base-300"}`}>
                                    {!isEditing ? (
                                        m.text
                                    ) : (
                                        <div>
                                            <textarea
                                                className="textarea textarea-bordered w-full md:w-[48rem] max-w-full min-h-[8rem] resize-y bg-base-100 text-base-content"
                                                value={editDraft}
                                                onChange={(e) => setEditDraft(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEditAndResend_NewBranch(); }
                                                    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
                                                }}
                                                autoFocus
                                            />
                                            <div className="mt-3 flex justify-end gap-2">
                                                <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>
                                                <button type="button" className="btn btn-neutral" onClick={saveEditAndResend_NewBranch}>Send</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Edit button: bottom-right outside the bubble */}
                                {isYou && !isEditing && (
                                    <button
                                        type="button"
                                        title="Edit & re-ask (creates a new branch)"
                                        onClick={() => startEdit(i)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-3 right-0 btn btn-ghost btn-xs z-10"
                                    >
                                        ✏️ Edit
                                    </button>
                                )}

                                {/* Numeric branch pills (1..N) for this fork point */}
                                {editingIndex === null && options.length > 1 && (
                                    <div className="mt-3 flex items-center gap-1">
                                        {options.map((id, idx) => (
                                            <button key={id} type="button" onClick={() => switchBranch(id)} className={`btn btn-xs ${idx === activeOptionIdx ? "btn-primary" : "btn-outline"}`} title={`${idx + 1} • ${shortTime((branches.find((b) => b.id === id) || {}).createdAt)}`}>
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {isThinking && (
                    <div className="text-left"><div className="inline-block px-3 py-2 rounded-lg bg-base-300 opacity-70">thinking…</div></div>
                )}
            </div>

            {/* Composer */}
            <form onSubmit={send} className="px-3 pt-3 pb-6 border-t bg-base-100">
                <div className="relative">
                    <textarea value={input} ref={textareaRef} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" rows={5} className="textarea textarea-bordered w-full rounded-lg text-base pr-28" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); } }} />
                    <div className="absolute right-2 bottom-2 flex gap-2">
                        <SpeechToTextButton onResult={(spoken) => { const ta = textareaRef.current; if (!ta) return; insertTextAt(ta, ta.value, spoken, setInput); }} />
                    </div>
                </div>
            </form>
        </div>
    );
}

// Encapsulates all chat logic: persistence, per-branch sessions, branching,
// editing (Send/Cancel), numbered pills, registry export.

import { useEffect, useMemo, useRef, useState } from "react";
import { useAnswersRegistry } from "../../../context/AnswersRegistry";
import { createChatSession } from "../../../services/aiApi/chat";
import { CHAT_STORAGE_VERSION, normalizeBranchesData, uidLike } from "./chatUtils";

export function useChatStore({
    storageKey,
    opener,
    registryKey,
    group,
    maxMessagesToSave,
}) {
    const { set: regSet, remove: regRemove } = useAnswersRegistry();

    // ----- Persisted branches state -----
    const loadFromLocal = () => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (
                    parsed?.formatVersion === CHAT_STORAGE_VERSION &&
                    Array.isArray(parsed?.branches) &&
                    parsed?.activeId
                ) {
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
        const b0 = {
            id: uidLike(),
            title: "Main",
            messages: [opener],
            createdAt: Date.now(),
        };
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

    const activeBranch = useMemo(
        () => branches.find((b) => b.id === activeId) || branches[0],
        [branches, activeId]
    );
    const messages = activeBranch?.messages ?? [];

    // ----- One chat session per branch -----
    const chatRef = useRef(null);                 // current active session
    const sessionsRef = useRef(new Map());        // Map<branchId, session>

    function initSessionForBranch(branchId, historyOverride) {
        const existing = sessionsRef.current.get(branchId);
        if (existing && !historyOverride) {
            chatRef.current = existing;
            return existing;
        }
        const branch = branches.find((b) => b.id === branchId);
        const history = Array.isArray(historyOverride) ? historyOverride : (branch?.messages || []);
        const session = createChatSession(history);
        sessionsRef.current.set(branchId, session);
        chatRef.current = session;
        return session;
    }

    function ensureSessionForActive() {
        let s = sessionsRef.current.get(activeId);
        if (!s) s = initSessionForBranch(activeId);
        chatRef.current = s;
        return s;
    }

    function resetSessionForBranch(branchId, history) {
        const session = createChatSession(history);
        sessionsRef.current.set(branchId, session);
        if (branchId === activeId) chatRef.current = session;
        return session;
    }

    // Mount: create a session for the initial branch from its messages
    useEffect(() => {
        initSessionForBranch(activeId, messages);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ----- Persistence helpers -----
    const persist = (nextBranches, nextActiveId = activeId) => {
        setBranches(nextBranches);
        setActiveId(nextActiveId);
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    branches: nextBranches,
                    activeId: nextActiveId,
                    formatVersion: CHAT_STORAGE_VERSION,
                })
            );
        } catch { }
    };

    const updateBranchMessages = (branchId, updater, persistActiveIdOverride) => {
        setBranches((prev) => {
            const next = prev.map((b) => (b.id === branchId ? { ...b, messages: updater(b.messages) } : b));
            try {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify({
                        branches: next,
                        activeId: persistActiveIdOverride ?? activeId,
                        formatVersion: CHAT_STORAGE_VERSION,
                    })
                );
            } catch { }
            return next;
        });
        if (persistActiveIdOverride != null) setActiveId(persistActiveIdOverride);
    };
    const setActiveMessages = (updater) => updateBranchMessages(activeId, updater);

    // ----- Send -----
    const send = async (e) => {
        e?.preventDefault?.();
        const t = (typeof e === "string" ? e : input).trim();
        if (!t) return;

        const session = ensureSessionForActive();

        setActiveMessages((m) => [...m, { role: "you", text: t }]);
        if (typeof e !== "string") setInput("");

        setIsThinking(true);
        try {
            const reply = await session.send(t);
            setActiveMessages((m) => [...m, { role: "ai", text: reply || "(no response)" }]);
        } catch (err) {
            setActiveMessages((m) => [...m, { role: "ai", text: "Oops—something went wrong. Please try again." }]);
            // eslint-disable-next-line no-console
            console.warn("chat error:", err);
        } finally {
            setIsThinking(false);
        }
    };

    // ----- Editing → ALWAYS create new branch on Send -----
    const startEdit = (idx) => {
        const msg = messages[idx];
        if (!msg || msg.role !== "you") return; // only edit your own turns
        setEditingIndex(idx);
        setEditDraft(msg.text);
    };
    const cancelEdit = () => { setEditingIndex(null); setEditDraft(""); };

    const saveEditAndResend_NewBranch = async () => {
        if (editingIndex == null) return;
        const editedText = editDraft.trim();
        if (!editedText) return;

        // PRIOR context (exclude the edited user turn), includes earlier assistant replies
        const prior = messages.slice(0, editingIndex);

        // UI transcript of the new branch includes the edited user turn
        const newBranch = {
            id: uidLike(),
            title: "Fork",
            messages: [...prior, { role: "you", text: editedText }],
            createdAt: Date.now(),
            parentId:
                activeBranch.parentId && activeBranch.forkedFromIndex === editingIndex
                    ? activeBranch.parentId
                    : activeId,
            forkedFromIndex: editingIndex,
        };

        const nextBranches = [...branches, newBranch];
        persist(nextBranches, newBranch.id);

        cancelEdit();
        setIsThinking(true);

        try {
            // Prime the session with PRIOR only (no duplicate of edited user turn)
            const session = initSessionForBranch(newBranch.id, prior);

            // Now send the edited message ONCE
            const reply = await session.send(editedText);

            // Append AI reply to the array that already includes the new branch
            const appended = nextBranches.map((b) =>
                b.id === newBranch.id
                    ? { ...b, messages: [...(b.messages || []), { role: "ai", text: reply || "(no response)" }] }
                    : b
            );
            persist(appended, newBranch.id);
        } catch (err) {
            setActiveMessages((m) => [
                ...m,
                { role: "ai", text: "(edit) We couldn't refresh from here. Please try again." },
            ]);
            console.warn("fork+resend error:", err);
        } finally {
            setIsThinking(false);
        }
    };

    // ----- Switch branch (restore the right session/memory) -----
    const switchBranch = (id) => {
        setActiveId(id);
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({ branches, activeId: id, formatVersion: CHAT_STORAGE_VERSION })
            );
        } catch { }
        initSessionForBranch(id);
    };

    // Registry export (cap messages per branch)
    useEffect(() => {
        const anyMeaningful = branches.some((b) => (b.messages?.length || 0) > 1);
        if (!anyMeaningful) { regRemove(registryKey); return; }
        regSet(registryKey, {
            type: registryKey,
            answers: {
                group,
                activeBranch: activeId,
                branches: branches.map((b) => ({
                    id: b.id,
                    title: b.title,
                    parentId: b.parentId,
                    forkedFromIndex: b.forkedFromIndex,
                    messages: (b.messages || []).slice(-maxMessagesToSave),
                })),
            },
        });
    }, [branches, activeId, group, maxMessagesToSave, regSet, regRemove, registryKey]);

    // Options for branch pills for message i
    const optionsForMessage = (i, currentId) => {
        const anchorParentId =
            activeBranch.parentId && activeBranch.forkedFromIndex === i
                ? activeBranch.parentId
                : activeId;

        const siblings = branches
            .filter((br) => br.parentId === anchorParentId && br.forkedFromIndex === i)
            .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        const options = [anchorParentId, ...siblings.map((b) => b.id)];
        const activeOptionIdx = options.findIndex((id) => id === (currentId || activeId));
        return { options, activeOptionIdx };
    };

    return {
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
    };
}

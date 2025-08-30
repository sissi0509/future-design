import { useEffect, useMemo, useRef, useState } from "react";
import { createChatSession } from "../../../services/aiApi/chat";
import { loadConversation, saveConversation, uidLike } from "./chatUtils";
import { logClientError } from "../../../services/errorHandle/logClientError";

const AI_SOURCE = "gemini-2.5-flash";

export function useChatStore({
    storageKey,
    opener,
    maxMessagesToSave,
    logSystemGenerated,
}) {
    const initial = useMemo(() => loadConversation(storageKey, opener), []);
    const [branches, setBranches] = useState(initial.branches);
    const [activeId, setActiveId] = useState(initial.activeId);

    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editDraft, setEditDraft] = useState("");

    const activeBranch = useMemo(
        () => branches.find(b => b.id === activeId) || branches[0],
        [branches, activeId]
    );
    const messages = activeBranch?.messages ?? [];

    // one session per branch
    const chatRef = useRef(null);
    const sessionsRef = useRef(new Map());

    const persist = (nextBranches = branches, nextActiveId = activeId) => {
        const convo = { branches: nextBranches, activeId: nextActiveId };
        setBranches(nextBranches);
        setActiveId(nextActiveId);
        saveConversation(storageKey, convo);
    };

    const initSessionForBranch = (branchId, historyOverride) => {
        const existing = sessionsRef.current.get(branchId);
        if (existing && !historyOverride) {
            chatRef.current = existing;
            return existing;
        }
        const branch = branches.find(b => b.id === branchId);
        const history = Array.isArray(historyOverride) ? historyOverride : (branch?.messages || []);
        const session = createChatSession(history);
        sessionsRef.current.set(branchId, session);
        chatRef.current = session;
        return session;
    };

    useEffect(() => {
        initSessionForBranch(activeId, messages);
    }, []);

    const updateBranchMessages = (branchId, updater) => {
        setBranches(prev => {
            const next = prev.map(b => (b.id === branchId ? { ...b, messages: updater(b.messages) } : b));
            //cap per-branch 
            if (maxMessagesToSave && maxMessagesToSave > 0) {
                const capped = next.map(b =>
                    b.id === branchId
                        ? { ...b, messages: (b.messages ?? []).slice(-maxMessagesToSave) }
                        : b
                );
                saveConversation(storageKey, { branches: capped, activeId });
                return capped;
            }
            saveConversation(storageKey, { branches: next, activeId });
            return next;
        });
    };
    const setActiveMessages = (updater) => updateBranchMessages(activeId, updater);

    const ensureSessionForActive = () => {
        let s = sessionsRef.current.get(activeId);
        if (!s) s = initSessionForBranch(activeId);
        chatRef.current = s;
        return s;
    };

    // send
    const send = async (e) => {
        e?.preventDefault?.();
        const t = (typeof e === "string" ? e : input).trim();
        if (!t) return;

        const session = ensureSessionForActive();
        setActiveMessages(m => [...m, { role: "you", text: t }]);
        if (typeof e !== "string") setInput("");

        setIsThinking(true);
        try {
            const reply = await session.send(t);
            setActiveMessages(m => [...m, { role: "ai", text: reply || "(no response)" }]);
            try { logSystemGenerated?.(AI_SOURCE, reply || ""); } catch { }
        } catch (err) {
            setActiveMessages(m => [...m, { role: "ai", text: "Oops—something went wrong. Please try again." }]);
            logClientError({ error: err, source: "useChatStore.send", reason: `session.send failed (branchId=${activeId})` });
        } finally {
            setIsThinking(false);
        }
    };

    // edit → new branch
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

        const prior = messages.slice(0, editingIndex);
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
            const session = initSessionForBranch(newBranch.id, prior); // override history
            const reply = await session.send(editedText);
            const appended = nextBranches.map(b =>
                b.id === newBranch.id
                    ? { ...b, messages: [...(b.messages || []), { role: "ai", text: reply || "(no response)" }] }
                    : b
            );
            persist(appended, newBranch.id);
        } catch (err) {
            setActiveMessages(m => [...m, { role: "ai", text: "(edit) We couldn't refresh from here. Please try again." }]);
            logClientError({ error: err, source: "useChatStore.send", reason: `session.send failed (branchId=${activeId})` });
        } finally {
            setIsThinking(false);
        }
    };

    // switch branch
    const switchBranch = (id) => {
        persist(branches, id);
        initSessionForBranch(id);
    };

    // branch options UI helper
    const optionsForMessage = (i, currentId) => {
        const anchorParentId =
            activeBranch.parentId && activeBranch.forkedFromIndex === i
                ? activeBranch.parentId
                : activeId;

        const siblings = branches
            .filter(br => br.parentId === anchorParentId && br.forkedFromIndex === i)
            .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        const options = [anchorParentId, ...siblings.map(b => b.id)];
        const activeOptionIdx = options.findIndex(id => id === (currentId || activeId));
        return { options, activeOptionIdx };
    };

    return {
        state: { branches, activeId, messages, input, isThinking, editingIndex, editDraft },
        actions: {
            setInput, send, startEdit, cancelEdit, setEditDraft,
            saveEditAndResend_NewBranch, switchBranch, optionsForMessage,
        },
    };
}

export function uidLike() {
    return Math.random().toString(36).slice(2, 10);
}

/** Our canonical message shape: { role: "you" | "ai", text: string } */
export function isCanonMessage(m) {
    return (
        m &&
        typeof m === "object" &&
        (m.role === "you" || m.role === "ai") &&
        typeof m.text === "string"
    );
}

export function normalizeBranchesData(parsed, openerText) {
    if (!parsed || !Array.isArray(parsed.branches)) return null;

    const branches = parsed.branches.map((b) => {
        const msgs = Array.isArray(b.messages) ? b.messages.filter(isCanonMessage) : [];
        return {
            id: b.id || uidLike(),
            title: b.title || "Main",
            createdAt: b.createdAt || Date.now(),
            messages: msgs.length ? msgs : [{ role: "ai", text: openerText }],
            parentId: b.parentId,
            forkedFromIndex:
                typeof b.forkedFromIndex === "number" ? b.forkedFromIndex : undefined,
        };
    });

    if (!branches.length) return null;

    const activeId =
        (parsed.activeId && branches.find((b) => b.id === parsed.activeId)?.id) ||
        branches[0].id;

    return { branches, activeId };
}

// Build a single-branch transcript (active branch) from what you already store
export function buildConversationTranscriptFromStored({
    storageKey,            // e.g. `chat-trainingAiConversation-<uid>`
    openerText = "Hi! Ask me anything as you work.",
    maxMessages = 200,
}) {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        const normalized = normalizeBranchesData(parsed, openerText);
        if (!normalized) return null;

        const { branches, activeId } = normalized;
        const active = branches.find(b => b.id === activeId) || branches[0];
        const msgs = Array.isArray(active?.messages) ? active.messages : [];

        // Keep the last N messages and ensure canonical shape
        const messages = msgs
            .slice(-maxMessages)
            .filter(isCanonMessage)
            .map(m => ({ role: m.role, text: String(m.text ?? "") }));

        // lightweight branch metadata 
        const branchesMeta = branches.map(b => ({
            id: b.id,
            title: b.title ?? null,
            createdAt: b.createdAt ?? null,
            parentId: b.parentId ?? null,
            forkedFromIndex: typeof b.forkedFromIndex === "number" ? b.forkedFromIndex : null,
        }));

        return { activeId, messages, branchesMeta };
    } catch {
        return null;
    }
}

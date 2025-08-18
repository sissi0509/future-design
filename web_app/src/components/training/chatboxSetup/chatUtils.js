// Small helpers & storage format utilities

export const CHAT_STORAGE_VERSION = 5;

export function uidLike() {
    return Math.random().toString(36).slice(2, 10);
}

export function coerceMessage(msg, idx, openerText) {
    if (
        msg &&
        typeof msg === "object" &&
        typeof msg.text === "string" &&
        (msg.role === "you" || msg.role === "ai")
    ) {
        return msg;
    }
    const text = typeof msg === "string" ? msg : (msg && (msg.text || msg.content)) || "";
    if (msg && typeof msg === "object" && typeof msg.sender === "string") {
        const s = msg.sender.toLowerCase();
        if (s === "user" || s === "you") return { role: "you", text };
        if (s === "assistant" || s === "ai" || s === "model") return { role: "ai", text };
    }
    if (idx === 0 || text === openerText) return { role: "ai", text };
    return { role: idx % 2 === 1 ? "you" : "ai", text };
}

export function normalizeBranchesData(parsed, openerText) {
    if (!parsed) return null;

    // Very old single-thread shape -> wrap into one branch
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
        messages: Array.isArray(b.messages)
            ? b.messages.map((m, i) => coerceMessage(m, i, openerText))
            : [{ role: "ai", text: openerText }],
        parentId: b.parentId,
        forkedFromIndex: typeof b.forkedFromIndex === "number" ? b.forkedFromIndex : undefined,
    }));

    const activeId =
        parsed.activeId && branches.find((b) => b.id === parsed.activeId)
            ? parsed.activeId
            : branches[0].id;

    return { branches, activeId, formatVersion: CHAT_STORAGE_VERSION };
}

export function shortTime(ts) {
    try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
}

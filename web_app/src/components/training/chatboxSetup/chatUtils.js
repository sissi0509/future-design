export function uidLike() {
    return Math.random().toString(36).slice(2, 10);
}

export function fresh(opener) {
    const b0 = {
        id: uidLike(),
        title: "Main",
        createdAt: Date.now(),
        messages: opener && opener.role && typeof opener.text !== "undefined" ? [opener] : [],
    };
    return { branches: [b0], activeId: b0.id };
}

export function loadConversation(storageKey, opener) {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return fresh(opener);
        const parsed = JSON.parse(raw);
        if (!parsed?.activeId || !Array.isArray(parsed?.branches)) return fresh(opener);
        return parsed;
    } catch {
        return fresh(opener);
    }
}

export function saveConversation(storageKey, convo) {
    try { localStorage.setItem(storageKey, JSON.stringify(convo)); } catch { }
}


export function buildFullTranscript(convo, maxPerBranch = 200) {
    const { branches, activeId } = convo;
    const getTime = (v) => typeof v === "number" ? v : (v ? Date.parse(v) : 0);


    // oldest → newest
    const ordered = [...branches].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    return {
        activeId,
        branches: ordered.map(b => ({
            id: b.id,
            title: b.title ?? null,
            createdAt: b.createdAt ? new Date(getTime(b.createdAt)).toISOString() : null,
            parentId: b.parentId ?? null,
            forkedFromIndex: typeof b.forkedFromIndex === "number" ? b.forkedFromIndex : null, // The message index in parentId branch that was edited to create this fork
            messages: (b.messages ?? [])
                .slice(-maxPerBranch)
                .map(m => ({ role: m.role, text: String(m.text ?? "") })),
        })),
    };
}

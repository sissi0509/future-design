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

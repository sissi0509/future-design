export function buildActor(user) {
    return {
        objectType: "Agent",
        account: {
            name: user.uid,
        },
    };
}

export function buildSystemActor(source = "system") {
    return {
        objectType: "Agent",
        name: source,
        mbox: `mailto:${source}@futuredesign.app`,
    };
}

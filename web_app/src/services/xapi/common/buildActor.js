export function buildActor(user) {
    return {
        objectType: "Agent",
        name: user.email,
        mbox: `mailto:${user.email}`,
        account: {
            name: user.uid,
        },
    };
}

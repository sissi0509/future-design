export const AI_OPENERS = {
    1: "You are in Group 1. ",
    2: "You are in Group 2. ",
    3: "You are in Group 3.",
    default: "Hi! Ask me anything as you work.",
};

export function getCoachPrompt(group) {
    const key = String(group ?? "");
    return AI_OPENERS[key] ?? AI_OPENERS.default;
}
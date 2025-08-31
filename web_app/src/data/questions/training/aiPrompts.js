import instructionContent from "./instruction";
import warmUpQuestions from "./warmup";
import strategyQuestions from "./strategy";
import planQuestions from "./plan";
import goalQuestions from "./goal";


export const STARTER_INTRO = [
    "Hi there! 👋 I'm here to help you think through your goal.",
    "These six strategies can give you new insights and help you plan more clearly.",
    "Click each bubble to explore:",
].join("\n\n");

export const STARTER_BUBBLES = [
    { text: 'The Right Answer' },
    { text: 'Model Cases' },
    { text: 'Contrary Cases' },
    { text: 'Borderline Cases' },
    { text: 'Underlying Anxiety' },
    { text: 'Be Honest and Straightforward' }
]



export function buildInstructionPrompt() {
    const cells = instructionContent?.table?.rows.flat()

    const bullets = cells
        .filter(c => c && (c.title || c.text))
        .map(c => `${c.title || "(untitled)"}. ${c.text || ""}`)
        .join("\n");

    const header = [
        "You are a FUTURE-PLANNING COACH in a training app.",
        "Use the INSTRUCTIONS below to guide your coaching.",
        "The user my type the instruction title so you can explain them",
    ].join("\n");

    return `${header}\n\nINSTRUCTIONS:\n${bullets}`;
}

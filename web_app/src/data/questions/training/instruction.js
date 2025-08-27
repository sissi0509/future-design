// All display-only content for the Instruction step.
const instructionContent = {
    intro: [
        "Please do not look up any outside resources or GenAI chatbots (ChatGPT, Google Gemini, etc.). We want to see what you do with the provided resources. Thank you!",
        "Questions about the future often do not have any single, clear-cut solution. However, there are some general considerations which are nearly always of use to us, and which we should remember to apply whenever we are faced with any question with inherent ambiguity and uncertainty (Wilson, 1963)."
    ],
    table: {
        title: "Techniques for Thinking About the Future",
        // 3 rows × 2 columns; each cell has a title + text
        rows: [
            [
                {
                    title: "(1) The Right Answer",
                    text:
                        "When thinking about whether an action should be in the plan, the answer must sometimes be given in the form ‘If by reaching my goal I mean abc, then yes, because… but if I mean xyz, then no because…’"
                },
                {
                    title: "(2) Model Cases",
                    text:
                        "One of the best ways to start, particularly if we feel completely lost, is to pick a model case: an instance we are absolutely sure is an instance of achieving a goal—something of which we could say ‘Well if that isn’t an example of achieving my goal, then nothing is’."
                }
            ],
            [
                {
                    title: "(3) Contrary Cases",
                    text:
                        "It is also helpful to think by an opposite method, taking cases of which we can say ‘Well, whatever my goal is, that certainly isn’t an instance of it’."

                },
                {
                    title: "(4) Borderline Cases",
                    text:
                        "It is also helpful to think of precisely those cases where we are not sure, and see what we would say about them. Think of an example that has some features in common with the model case of achieving a goal, but perhaps not enough: and we then look to see which is the important features that is missing."
                }
            ],
            [
                {
                    title: "(5) Underlying Anxiety",
                    text:
                        "Questions about the future often arise because of some underlying anxiety: certain features of life seem somehow to threaten the way in which we had always thought, and hence give us a feeling of insecurity. The underlying anxiety is useful to notice for understanding the root of a challenging question."
                },
                {
                    title: "(6) Be Honest and Straightforward",
                    text:
                        "Simple language makes plans easier to read and remember, and helps us find mistakes and fix them. Ask yourself, Do I really mean this? Is this really what I intend to say? Is this really true? No statement can be perfect and complete, but by being conscious of imperfections in one’s statements, one can gain an increasingly better understanding of the truth."
                }
            ]
        ]
    },
    outro:
        "On the next page, apply these techniques."
};

export default instructionContent;

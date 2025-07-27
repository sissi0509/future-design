const level1 = {
    heading: "Level1: Match the question types to their descriptions",
    level: 'level1',
    questions: [
        { id: 'q1', question: 'Judge value using evidence & reasoning within a system', correct: 'A' },
        { id: 'q2', question: 'Calls for stating a subjective preference', correct: 'B' },
        { id: 'q3', question: 'Judge value using evidence & reasoning within multiple systems', correct: 'C' },
        { id: 'q4', question: 'Understand the standard meaning of a word', correct: 'D' },
        { id: 'q5', question: 'Understand nature and limits of concept', correct: 'E' },
        { id: 'q6', question: 'Answer has already been determined', correct: 'F' },
        { id: 'q7', question: 'Has not been definitively answered', correct: 'G' },
    ],
    options: {
        A: 'One System',
        B: 'No System',
        C: 'Conflicting System',
        D: 'Simple Conceptual',
        E: 'Complex Conceptual',
        F: 'Settled Empirical',
        G: 'Unsettled Empirical',
    }
}

export default level1;

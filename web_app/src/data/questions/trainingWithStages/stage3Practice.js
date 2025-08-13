const stage3PracticeQuestions = [
    {
        type: 'multiple',
        key: 'stage3q1',
        label: '1. What is one benefit of identifying “weak signals” in your environment?',
        options: [
            'They guarantee accurate predictions',
            'They may indicate emerging trends before they become obvious',
            'They allow you to ignore major developments',
            'They eliminate the need for any further research',
        ],
        correct: 'They may indicate emerging trends before they become obvious',
    },
    {
        type: 'multiple',
        key: 'stage3q2',
        label: '2. Which approach best demonstrates resilience?',
        options: [
            'Refusing to change plans under any circumstances',
            'Quickly adjusting to challenges while staying focused on long-term goals',
            'Avoiding any risks at all',
            'Only planning for best-case scenarios',
        ],
        correct: 'Quickly adjusting to challenges while staying focused on long-term goals',
    },
    {
        type: 'multiple',
        key: 'stage3q3',
        label: '3. When evaluating possible future paths, why might you create a “worst-case scenario”?',
        options: [
            'To prepare strategies to reduce potential harm',
            'To avoid thinking about success',
            'To convince yourself to abandon your plans',
            'To focus only on negative outcomes',
        ],
        correct: 'To prepare strategies to reduce potential harm',
    },
    {
        type: 'text',
        key: 'stage3q4',
        label: '4. Think of a current project you have. Describe a “best-case” and a “worst-case” future for it.',
        minWords: 8,
        maxWords: 50,
    },
];
export default stage3PracticeQuestions;

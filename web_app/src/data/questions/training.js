const trainingQuestions = [
    {
        type: 'multiple',
        key: 'q1',
        label: '1. What is the main goal of future thinking?',
        options: [
            'To predict exactly what will happen tomorrow',
            'To imagine multiple possible futures and plan for them',
            'To build time machines',
            'To focus only on past experiences',
        ],
        correct: 'To imagine multiple possible futures and plan for them',
    },
    {
        type: 'multiple',
        key: 'q2',
        label: '2. Which of the following is a future thinking method?',
        options: [
            'Mind reading',
            'Fortune telling',
            'Scenario planning',
            'Time travel',
        ],
        correct: 'Scenario planning',
    },
    {
        type: 'text',
        key: 'q3',
        label: '3. Think of one possible future (realistic or imaginative) for your career or life. Describe it briefly.',
        minWords: 5,
        maxWords: 40,
    },
    {
        type: 'multiple',
        key: 'q4',
        label: '4. What is a key reason why diverse perspectives are important in future thinking?',
        options: [
            'Because everyone should agree on one future',
            'To make sure predictions are perfect',
            'To reduce creativity in planning',
            'To explore futures that consider different needs and values',
        ],
        correct: 'To explore futures that consider different needs and values',
    },
    {
        type: 'text',
        key: 'q5',
        label: '5. Why might it be risky to base our future planning only on current trends?',
        minWords: 8,
        maxWords: 50,
    },
];

export default trainingQuestions;

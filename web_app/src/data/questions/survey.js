const surveyQuestions = [
    {
        type: 'text',
        key: 's1',
        label: '1. What part of the training helped you the most?',
        minWords: 5,
        maxWords: 50,
    },
    {
        type: 'text',
        key: 's2',
        label: '2. Was there anything unclear or confusing?',
        minWords: 5,
        maxWords: 50,
    },
    {
        type: 'multiple',
        key: 's3',
        label: '3. How confident do you feel about applying future thinking after this module?',
        options: ['Very confident', 'Somewhat confident', 'Not confident', 'Unsure'],
        correct: null,
    },
    {
        type: 'text',
        key: 's4',
        label: '4. Any suggestions for improving this training?(optional)',
        minWords: 0,
        maxWords: 60,
    },
];

export default surveyQuestions;

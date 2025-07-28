const preTestQuestions = [
    {
        type: 'text',
        key: 'q1',
        label: '1. What is your understanding of AI?',
        minWords: 5,
        maxWords: 50,
    },
    {
        type: 'multiple',
        key: 'q2',
        label: '2. Select the most accurate statement about machine learning:',
        options: [
            'It learns from data',
            'It memorizes rules',
            'It’s always accurate',
            'It replaces humans',
        ],
        correct: 'It learns from data',
    },
    {
        type: 'text',
        key: 'q3',
        label: '3. What concerns or hopes do you have about AI?',
        minWords: 10,
        maxWords: 40,
    },
];
export default preTestQuestions;
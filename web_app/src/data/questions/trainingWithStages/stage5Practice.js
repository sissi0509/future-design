const stage5PracticeQuestions = [
    {
        type: 'multiple',
        key: 'stage5q1',
        label: '1. What is the purpose of reviewing and reflecting after a project is completed?',
        options: [
            'To assign blame for mistakes',
            'To learn lessons that can improve future outcomes',
            'To immediately start a new project without review',
            'To prove that the plan was perfect',
        ],
        correct: 'To learn lessons that can improve future outcomes',
    },
    {
        type: 'multiple',
        key: 'stage5q2',
        label: '2. Which activity best represents continuous improvement?',
        options: [
            'Repeating the same process without changes',
            'Updating methods based on feedback and results',
            'Avoiding feedback to save time',
            'Only changing plans if something goes wrong',
        ],
        correct: 'Updating methods based on feedback and results',
    },
    {
        type: 'multiple',
        key: 'stage5q3',
        label: '3. How can storytelling help communicate a future vision?',
        options: [
            'By making complex ideas more relatable and engaging',
            'By avoiding facts and focusing on fiction',
            'By hiding important details',
            'By making people feel less involved',
        ],
        correct: 'By making complex ideas more relatable and engaging',
    },
    {
        type: 'text',
        key: 'stage5q4',
        label: '4. Share one lesson you’ve learned from a past experience that you would apply to future planning.',
        minWords: 8,
        maxWords: 50,
    },
];
export default stage5PracticeQuestions;

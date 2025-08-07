const postTestQuestions = [
    {
        type: 'multiple',
        key: 'post1',
        label: '1. What does "foresight" help you do?',
        options: [
            'Forget past mistakes',
            'Predict every detail of the future',
            'Think ahead and prepare for different possibilities',
            'Avoid planning',
        ],
        correct: 'Think ahead and prepare for different possibilities',
    },
    {
        type: 'text',
        key: 'post2',
        label: '2. After this training, what is one new strategy you will try to apply to your own future planning?',
        minWords: 8,
        maxWords: 50,
    },
    {
        type: 'multiple',
        key: 'post3',
        label: '3. Which of the following shows effective future thinking?',
        options: [
            'Following routines without question',
            'Imagining one ideal future and ignoring alternatives',
            'Exploring different paths and adapting to changes',
            'Avoiding all risks',
        ],
        correct: 'Exploring different paths and adapting to changes',
    },
];
export default postTestQuestions;

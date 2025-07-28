const postTestQuestions = [
    {
        type: 'text',
        key: 'q1',
        label: '1. After completing the training, how has your view of AI changed?',
        minWords: 5,
        maxWords: 50,
    },
    {
        type: 'multiple',
        key: 'q2',
        label: '2. Which of the following best describes supervised learning?',
        options: [
            'Learning without any labeled data',
            'Learning from labeled examples',
            'Exploring without feedback',
            'Learning only from rewards',
        ],
        correct: 'Learning from labeled examples',
    },
    {
        type: 'multiple',
        key: 'q3',
        label: '3. Which domain is AI currently most widely used in?',
        options: [
            'Teleportation',
            'Medical diagnostics',
            'Time travel',
            'Gravity control',
        ],
        correct: 'Medical diagnostics',
    },
    {
        type: 'text',
        key: 'q4',
        label: '4. What potential benefits do you now see in using AI for solving real-world problems?',
        minWords: 10,
        maxWords: 60,
    },
    {
        type: 'multiple',
        key: 'q5',
        label: '5. What is one key limitation of current AI systems?',
        options: [
            'They understand emotions better than humans',
            'They are always unbiased',
            'They can reason with common sense perfectly',
            'They depend heavily on training data',
        ],
        correct: 'They depend heavily on training data',
    },
];
export default postTestQuestions;

const trainingQuestions = [
    {
        type: 'multiple',
        key: 'q1',
        label: '1. What does the term "AI" generally refer to?',
        options: [
            'A type of robot with emotions',
            'Human-like consciousness in machines',
            'Systems that mimic aspects of human intelligence',
            'Any software with graphics',
        ],
        correct: 'Systems that mimic aspects of human intelligence',
    },
    {
        type: 'multiple',
        key: 'q2',
        label: '2. Which of the following is an example of machine learning?',
        options: [
            'A microwave with a timer',
            'A program that learns to recognize cats from images',
            'Typing on a keyboard',
            'Printing documents from your phone',
        ],
        correct: 'A program that learns to recognize cats from images',
    },
    {
        type: 'text',
        key: 'q3',
        label: '3. Describe one real-world application of AI that you learned during training.',
        minWords: 5,
        maxWords: 40,
    },
    {
        type: 'multiple',
        key: 'q4',
        label: '4. What is a common ethical concern related to AI?',
        options: [
            'It makes coffee too fast',
            'It may replace all books with digital screens',
            'It can reinforce biases present in data',
            'It always tells the truth',
        ],
        correct: 'It can reinforce biases present in data',
    },
    {
        type: 'text',
        key: 'q5',
        label: '5. In your own words, explain why training data matters in AI.',
        minWords: 8,
        maxWords: 50,
    },
];
export default trainingQuestions;
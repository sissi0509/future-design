const preTestQuestions = [
    {
        type: 'multiple',
        key: 'pre1',
        label: '1. What does "future thinking" primarily involve?',
        options: [
            'Imagining unrealistic fantasies',
            'Analyzing past events in detail',
            'Considering possible futures and planning accordingly',
            'Memorizing future events',
        ],
        correct: 'Considering possible futures and planning accordingly',
    },
    {
        type: 'multiple',
        key: 'pre2',
        label: '2. Which of the following is an example of future thinking?',
        options: [
            'Reflecting on past mistakes',
            'Planning a 5-year career path based on current trends',
            'Avoiding making any decisions',
            'Only living in the moment',
        ],
        correct: 'Planning a 5-year career path based on current trends',
    },
    {
        type: 'text',
        key: 'pre3',
        label: '3. What do you personally hope to gain from thinking about your future?',
        minWords: 5,
        maxWords: 40,
    },
];
export default preTestQuestions;

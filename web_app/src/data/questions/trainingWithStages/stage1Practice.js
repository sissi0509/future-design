const stage1PracticeQuestions = [
    {
        type: 'multiple',
        key: 'stage1q1',
        label: '1. Why is it useful to identify trends in your environment?',
        options: [
            'To completely control the future',
            'To anticipate possible changes and prepare for them',
            'To avoid making any decisions',
            'To ensure nothing unexpected happens',
        ],
        correct: 'To anticipate possible changes and prepare for them',
    },
    {
        type: 'multiple',
        key: 'stage1q2',
        label: '2. Which of these is an example of considering multiple futures?',
        options: [
            'Making one fixed plan and sticking to it no matter what',
            'Creating a backup plan in case your first idea doesn’t work',
            'Ignoring alternative possibilities',
            'Waiting until problems appear before acting',
        ],
        correct: 'Creating a backup plan in case your first idea doesn’t work',
    },
    {
        type: 'multiple',
        key: 'stage1q3',
        label: '3. When using foresight tools, what is the main goal?',
        options: [
            'To predict the exact outcome of events',
            'To explore possibilities and guide better decisions',
            'To avoid thinking about risks',
            'To replace action with endless planning',
        ],
        correct: 'To explore possibilities and guide better decisions',
    },
    {
        type: 'text',
        key: 'stage1q4',
        label: '4. Describe one situation in your life where thinking about different possible futures could help you make a better decision.',
        minWords: 8,
        maxWords: 50,
    },
];
export default stage1PracticeQuestions;

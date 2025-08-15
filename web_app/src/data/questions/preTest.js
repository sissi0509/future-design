const preTestQuestions = [
    {
        type: 'multiple',
        key: 'pre1',
        kind: 'single',
        label: '1) What does “future thinking” primarily involve?',
        options: [
            'Only predicting exact outcomes',
            'Considering multiple possible futures and planning accordingly',
            'Ignoring uncertainty and acting immediately',
            'Memorizing timelines without action',
        ],
        correct: 'Considering multiple possible futures and planning accordingly',
    },

    {
        type: 'multiple',
        key: 'pre2',
        kind: 'single',
        label: '2) Which is the best example of future thinking in study planning?',
        options: [
            'Waiting to see what assignments appear',
            'Setting weekly practice blocks tied to a long-term goal',
            'Re-reading notes without a schedule',
            'Only reviewing the day before exams',
        ],
        correct: 'Setting weekly practice blocks tied to a long-term goal',
    },


    {
        type: 'multiple',
        kind: 'likert',
        key: 'pre3',
        label: '3) I feel confident applying future thinking to my coursework.',
        correct: null,
    },

    {
        type: 'multiple',
        kind: 'multi',
        key: 'pre4',
        label: '4) Which areas do you most want to strengthen? (Select all that apply)',
        options: [
            'Setting specific weekly actions',
            'Linking short-term tasks to long-term goals',
            'Finding supportive peers/mentors',
            'Tracking progress and adjusting plans',
        ],
        minSelect: 1,
        correct: null,
    },

    {
        type: 'text',
        key: 'pre5',
        label: '5) In one or two sentences, what future goal do you want this course to move you toward?',
        minWords: 5,
        maxWords: 40,
    },
];

export default preTestQuestions;

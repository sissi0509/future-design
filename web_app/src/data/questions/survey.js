const surveyQuestions = [
    // Text
    {
        type: 'text',
        key: 's1',
        label: '1) What part of the training helped you the most?',
        minWords: 5,
        maxWords: 60,
    },

    // Likert (horizontal radios). Omit options to use default 5-point.
    {
        type: 'multiple',
        kind: 'likert',
        key: 's2',
        label: '2) The training improved my confidence to apply future thinking.',
        // options: ["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"], // optional
    },

    // Single choice (radios)
    {
        type: 'multiple',
        kind: 'single',
        key: 's3',
        label: '3) Overall satisfaction with this training',
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
    },

    // Multi select (checkboxes)
    {
        type: 'multiple',
        kind: 'multi',
        key: 's4',
        label: '4) Which features did you use? (Select all that apply)',
        options: [
            'Reading materials',
            'Practice questions',
            'AI coach',
            'Reflections',
            'Examples/case studies',
        ],
        minSelect: 1,   // require at least one
    },

    // Optional free text
    {
        type: 'text',
        key: 's5',
        label: '5) Any suggestions for improving this training? (optional)',
        minWords: 0,
        maxWords: 80,
    },
];

export default surveyQuestions;

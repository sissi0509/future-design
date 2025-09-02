// postTestQuestions.js

export const LIKERT = [
    'Strongly agree',
    'Agree',
    'Neutral',
    'Disagree',
    'Strongly disagree',
];

const postTestQuestions = [
    {
        type: 'text',
        key: 'post1',
        label: [
            '1) Summarize the important parts of your 2-week plan.',
            'Attempting to recall as many details as possible here will help you remember it and apply it to your life.',
        ],
        minWords: 1,
        maxWords: 200,
    },

    {
        type: 'range',
        key: 'post2',
        label: [
            '2) At which day will you start to act on your plan?',
        ],
        rangeMin: 1,
        rangeMax: 14,
        startLabel: "At the first day",
        endLabel: "Two weeks from today",
        rangeStep: 1,
        minWords: 1,
        maxWords: 200,
    },

    {
        type: 'text',
        key: 'post3',
        label: '3) How many times a week do you expect to carry out your plan in the next two weeks?',
        minWords: 1,
        maxWords: 200,
    },

    {
        type: 'text',
        key: 'post4',
        label:
            '4) On days that you carry out your plan, how much time per day do you expect to commit (not including activities you are already doing)?',
        minWords: 1,
        maxWords: 200,
    },

    {
        type: 'text',
        key: 'post5',
        label:
            '5) What aspect of your long-term vision (e.g., 5 years from now) does your 2-week plan connect to?',
        minWords: 1,
        maxWords: 200,
    },

    {
        type: 'multiple',
        kind: 'likert',
        key: 'post6',
        label:
            '6) I am likely to achieve the aspects of my future vision described in Question 5.',
        options: LIKERT,
    },

    {
        type: 'multiple',
        kind: 'likert',
        key: 'post7',
        label:
            '7) There is a chance that I may not achieve the aspects of my future vision described in Question 5.',
        options: LIKERT,
    },
];

export default postTestQuestions;

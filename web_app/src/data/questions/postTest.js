// postTestQuestions.js

export const LIKERT = [
    'Strongly agree',
    'Agree',
    'Neutral',
    'Disagree',
    'Strongly disagree',
];

const postTestQuestions = [
    // 1) Summarize plan
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

    // 2) Draw timeline with hyphens and X
    {
        type: 'text',
        key: 'post2',
        label: [
            '2) In the space below, draw a horizontal line using hyphens (-) starting with today and ending with 2 weeks from now.',
            'Then mark an X on the line where you will start acting on your plan.',
        ],
        minWords: 1,
        maxWords: 40,
    },

    // 3) Frequency per week
    {
        type: 'text',
        key: 'post3',
        label: '3) How many times a week do you expect to carry out your plan in the next two weeks?',
        minWords: 1,
        maxWords: 10,
    },

    // 4) Time per day
    {
        type: 'text',
        key: 'post4',
        label:
            '4) On days that you carry out your plan, how much time per day do you expect to commit (not including activities you are already doing)?',
        minWords: 1,
        maxWords: 15,
    },

    // 5) Link to long-term vision
    {
        type: 'text',
        key: 'post5',
        label:
            '5) What aspect of your long-term vision (e.g., 5 years from now) does your 2-week plan connect to?',
        minWords: 5,
        maxWords: 120,
    },

    // 6) Likert — confidence
    {
        type: 'multiple',
        kind: 'likert',
        key: 'post6',
        label:
            '6) I am likely to achieve the aspects of my future vision described in Question 5.',
        options: LIKERT,
    },

    // 7) Likert — acknowledging uncertainty
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

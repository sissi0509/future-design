// surveyQuestions.js

export const LIKERT = [
    'Strongly agree',
    'Agree',
    'Neutral',
    'Disagree',
    'Strongly disagree',
];

export const FREQ5 = [
    'Never',
    'Rarely',
    'Occasionally',
    'Frequently',
    'Very frequently',
];

export const EMOTIONS = [
    'Bored',
    'Curious',
    'Confused',
    'Happy',
    'Impatient',
    'Humor',
    'Irritated',
    'Joy',
    'Overwhelmed',
    'Optimistic',
];

const surveyQuestions = [
    // 1) Process difficulty
    {
        type: 'multiple',
        kind: 'likert',
        key: 's1',
        label: '1) The whole process of developing my 2-week plan felt:',
        options: [
            'Trivial',
            'Easy',
            'Neither easy nor difficult',
            'Appropriately difficult',
            'Too difficult',
        ],
    },

    // 2) Two-row Likert (treated as ONE question)
    // Row 1: pick an emotion (use Likert layout with EMOTIONS as options)
    // Row 2: pick the frequency (FREQ5)
    {
        type: 'multiple',
        kind: 'likert-multi',
        key: 's2',
        label: '2) While developing your 2-week plan…',
        questions: [
            {
                label: 'Which emotion best describes how you felt?',
                options: EMOTIONS,
            },
            {
                label: 'How frequently did you feel that emotion?',
                options: FREQ5,
            },
        ],
    },

    // 3) Satisfaction with plan
    {
        type: 'multiple',
        kind: 'likert',
        key: 's3',
        label: '3) Did you create a plan you were satisfied with?',
        options: LIKERT,
    },

    // 4) Generative AI usage
    {
        type: 'multiple',
        kind: 'single',
        key: 's4',
        label: '4) Did you use Generative Artificial Intelligence chatbots during this session?',
        options: [
            'Yes, I used a chatbot available inside this application (e.g., the AI Coach)',
            'Yes, I used a chatbot from outside of this application (e.g., ChatGPT, Gemini)',
            'No, I did not use any chatbots',
        ],
    },

    // 5) Plans for next summer
    {
        type: 'multiple',
        kind: 'single',
        key: 's5',
        label: '5) Do you already have a plan for next summer?',
        options: [
            'I have an internship/job offer for next summer',
            'I have a full-time job offer for after graduation',
            'I have tentative plans',
            'I have no plans',
        ],
    },

    // 6) Wanted more support
    {
        type: 'multiple',
        kind: 'likert',
        key: 's6',
        label: '6) Did you want more support while writing your 2-week plan?',
        options: LIKERT,
    },

    // 7) Email copy
    {
        type: 'multiple',
        kind: 'single',
        key: 's7',
        label: '7) Do you want us to email you a copy of what you wrote down as your goal and plan from this session?',
        options: ['Yes', 'No'],
    },

    // 8) Open-ended comments
    {
        type: 'text',
        key: 's8',
        label: '8) Please let us know if you have any comments or suggestions.',
        minWords: 0,
        maxWords: 200,
    },
];

export default surveyQuestions;

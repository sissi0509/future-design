export const LIKERT = [
    'Strongly agree',
    'Agree',
    'Neutral',
    'Disagree',
    'Strongly disagree',
];


const surveyQuestions = [
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

    {
        type: "multiple",
        kind: "likert-matrix",
        key: "s2",
        label: "While developing your 2-week plan, did you feel:",
        rows: [
            { key: "bored", label: "Bored" },
            { key: "curious", label: "Curious" },
            { key: "confused", label: "Confused" },
            { key: "happy", label: "Happy" },
            { key: "impatient", label: "Impatient" },
            { key: "humor", label: "Humor" },
            { key: "irritated", label: "Irritated" },
            { key: "joy", label: "Joy" },
            { key: "overwhelmed", label: "Overwhelmed" },
            { key: "optimistic", label: "Optimistic" }
        ],
        columns: [ // shared options for all rows
            { key: "never", label: "Never" },
            { key: "rarely", label: "Rarely" },
            { key: "occasionally", label: "Occasionally" },
            { key: "frequently", label: "Frequently" },
            { key: "very_frequently", label: "Very frequently" }
        ]
    },

    {
        type: 'multiple',
        kind: 'likert',
        key: 's3',
        label: '3) Did you create a plan you were satisfied with?',
        options: LIKERT,
    },


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


    {
        type: 'text',
        key: 's8',
        label: '8) Please let us know if you have any comments or suggestions.',
        minWords: 0,
        maxWords: 200,
    },
];

export default surveyQuestions;

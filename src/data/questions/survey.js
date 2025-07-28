const surveyQuestions = [
    {
        key: 'satisfaction',
        label: 'How satisfied were you with this learning experience?',
        type: 'multiple',
        options: ['Very satisfied', 'Somewhat satisfied', 'Neutral', 'Somewhat dissatisfied', 'Very dissatisfied']
    },
    {
        key: 'clarity',
        label: 'How clear were the instructions and questions?',
        type: 'multiple',
        options: ['Very clear', 'Somewhat clear', 'Neutral', 'Somewhat unclear', 'Very unclear']
    },
    {
        key: 'engagement',
        label: 'How engaging did you find the content?',
        type: 'multiple',
        options: ['Very engaging', 'Somewhat engaging', 'Neutral', 'Somewhat boring', 'Very boring']
    },
    {
        key: 'confidence',
        label: 'After this activity, how confident do you feel about the topic?',
        type: 'multiple',
        options: ['Much more confident', 'Somewhat more confident', 'No change', 'Less confident']
    },
    {
        key: 'feedback',
        label: 'Do you have any feedback for us?',
        type: 'text',
        minWords: 1,
        maxWords: 150
    }
];

export default surveyQuestions;

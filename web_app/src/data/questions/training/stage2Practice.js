const stage2PracticeQuestions = [
    {
        type: 'multiple',
        key: 'stage2q1',
        label: '1. Why is it valuable to consider the perspectives of others when planning for the future?',
        options: [
            'It confuses the decision-making process',
            'It can reveal risks or opportunities you might have missed',
            'It slows down progress',
            'It guarantees everyone will agree',
        ],
        correct: 'It can reveal risks or opportunities you might have missed',
    },
    {
        type: 'multiple',
        key: 'stage2q2',
        label: '2. Which action best represents adapting to unexpected change?',
        options: [
            'Ignoring the change and sticking to the old plan',
            'Reassessing goals and adjusting your approach',
            'Waiting for someone else to decide what to do',
            'Cancelling all future plans entirely',
        ],
        correct: 'Reassessing goals and adjusting your approach',
    },
    {
        type: 'multiple',
        key: 'stage2q3',
        label: '3. In scenario planning, what is the main purpose of creating multiple scenarios?',
        options: [
            'To choose the one that will definitely happen',
            'To test strategies under different possible conditions',
            'To prove that the future is unpredictable',
            'To avoid making decisions now',
        ],
        correct: 'To test strategies under different possible conditions',
    },
    {
        type: 'text',
        key: 'stage2q4',
        label: '4. Describe a time when you adapted your plan because of an unexpected event. What did you change and why?',
        minWords: 8,
        maxWords: 50,
    },
];
export default stage2PracticeQuestions;

// ---- Reading (Stage 1 Evaluation) ----
export const reading = {
    heading: "Reading",
    sections: [
        {
            title: "Aligning Plans with Identity",
            body: `Evaluation helps you check whether your plans align with who you want to become and what you want to avoid (A1).

Link your long-term aim to short-term steps (A2). Weekly or daily actions make progress visible and reduce decision fatigue.

Choose specific, domain-targeted strategies (A3). State when, where, and how you’ll act so the next step is obvious.

Make sure your strategies fit your identity and social supports (A4). Use peers, mentors, or communities that match your values.

Mini case: Kai wants a research assistant role next term. They schedule two 45-minute paper-reading blocks each week (A2/A3), join a lab reading group that fits their identity (A4), and keep a one-page brief per paper.`
        }
    ]
};
// ---- Questions (Stage 1 Evaluation) ----
export const questions = [
    {
        type: 'multiple',
        key: 'e1',
        label: '1) Which plan best aligns with (A2) linking short-term actions to a long-term goal?',
        options: [
            'Wait until midterm to see what happens.',
            'Read 2 research papers weekly and write a brief to prepare for lab roles.',
            'Skim random blogs and hope an opportunity appears.',
            'Only set a long-term goal with no weekly actions.',
        ],
        correct: 'Read 2 research papers weekly and write a brief to prepare for lab roles.',
    },
    {
        type: 'multiple',
        key: 'e2',
        label: '2) Which statement best shows (A3) specific, domain-targeted strategies?',
        options: [
            '“I will try harder this semester.”',
            '“On Mon/Wed 6–6:45pm I’ll implement 1 DS&A problem and note the pattern.”',
            '“I’ll be successful somehow.”',
            '“I’ll think about studying when I feel motivated.”',
        ],
        correct: '“On Mon/Wed 6–6:45pm I’ll implement 1 DS&A problem and note the pattern.”',
    },
    {
        type: 'multiple',
        key: 'e3',
        label: '3) Which option violates (A4) identity congruence / social support?',
        options: [
            'Join a peer group that shares values and goals.',
            'Ask a friend to do weekly mock interviews.',
            'Keep goals secret to avoid feedback or accountability.',
            'Attend office hours to align strategies with course demands.',
        ],
        correct: 'Keep goals secret to avoid feedback or accountability.',
    },
    {
        type: 'text',
        key: 'e4',
        label: '4) Name one long-term goal and list two concrete 1–2 week actions. Who can support you?',
        minWords: 15,
        maxWords: 80,
    },
];

export default { reading, questions };
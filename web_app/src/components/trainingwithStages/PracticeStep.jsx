// PracticeStep.jsx
import Questionnaire from '../questions/QuestionNaire';

// Import practice question sets once, then map by stage number
import stage1PracticeQuestions from '../../data/questions/training/stage1Practice';
import stage2PracticeQuestions from '../../data/questions/training/stage2Practice';
import stage3PracticeQuestions from '../../data/questions/training/stage3Practice';
import stage4PracticeQuestions from '../../data/questions/training/stage4Practice';
import stage5PracticeQuestions from '../../data/questions/training/stage5Practice';
// If Stage 6 has no practice, you can omit it or point to a final set.

const PRACTICE_BY_STAGE = {
    1: stage1PracticeQuestions,
    2: stage2PracticeQuestions,
    3: stage3PracticeQuestions,
    4: stage4PracticeQuestions,
    5: stage5PracticeQuestions,
};

export default function PracticeStep({ stage, onBack, onComplete }) {
    const questions = PRACTICE_BY_STAGE[stage];

    return (
        <div className="mx-auto w-full max-w-3xl px-4 pt-4 pb-24">

            {!questions ? (
                <div className="rounded-xl border p-4">
                    <p>No practice questions found for Stage {stage}.</p>
                </div>
            ) : (
                <Questionnaire
                    questions={questions}
                    label={`Practice`}
                    collectionType={`stage${stage}Practice`}
                    userField={`progress.training.stage${stage}.practiceCompleted`}
                    onComplete={onComplete}
                />
            )}
        </div>
    );
}

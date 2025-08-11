import Questionnaire from '../components/questions/QuestionNaire';
import preTestQuestions from '../data/questions/preTest';

export default function PreTest({ onComplete }) {
    return (
        <Questionnaire
            questions={preTestQuestions}
            label="Pre-Test"
            collectionType="preTest"
            userField="progress.preTestCompleted"
            onComplete={onComplete}
        />
    );
}
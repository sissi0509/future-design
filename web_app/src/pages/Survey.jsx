import Questionnaire from '../components/questions/QuestionNaire';
import surveyQuestions from '../data/questions/survey';

export default function PreTest({ onComplete }) {
    return (
        <Questionnaire
            questions={surveyQuestions}
            label="Survey"
            collectionType="survey"
            userField="progress.surveyCompleted"
            onComplete={onComplete}
        />
    );
}
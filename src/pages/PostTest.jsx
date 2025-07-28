import Questionnaire from '../components/questions/QuestionNaire';
import postTestQuestions from '../data/questions/postTest';

export default function PostTest({ onComplete }) {
    return (
        <Questionnaire
            questions={postTestQuestions}
            label="Post-Test"
            collectionType="postTest"
            userField="postTestCompleted"
            onComplete={onComplete}
        />
    );
}
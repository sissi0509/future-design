import warmupQuestions from "../../data/questions/training/warmup";
import BasicQuestion from './BasicQuestion'

export default function WarmupPage({ onValidChange, currentUser }) {


    return (
        <BasicQuestion
            onValidChange={onValidChange}
            stage="training"
            step="warmup"
            currentUser={currentUser}
            question={warmupQuestions}
        />
    );
}

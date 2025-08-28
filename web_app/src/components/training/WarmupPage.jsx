import warmupQuestions from "../../data/questions/training/warmup";
import BasicQuestion from './BasicQuestion'

export default function WarmupPage({ onValidChange, currentUser, onKeyDown, logClick, logSystemGenerated }) {


    return (
        <BasicQuestion
            onValidChange={onValidChange}
            stage="training"
            step="warmup"
            currentUser={currentUser}
            question={warmupQuestions}
            logClick={logClick}
            logSystemGenerated={logSystemGenerated}
            onKeyDown={onKeyDown}
        />
    );
}

import planQuestions from "../../data/questions/training/plan";
import BasicQuestion from './BasicQuestion'

export default function PlanPage({ onValidChange, currentUser, onKeyDown, logClick, logSystemGenerated }) {


    return (
        <BasicQuestion
            onValidChange={onValidChange}
            stage="training"
            step="plan"
            currentUser={currentUser}
            question={planQuestions}
            logClick={logClick}
            logSystemGenerated={logSystemGenerated}
            onKeyDown={onKeyDown}
        />
    );
}

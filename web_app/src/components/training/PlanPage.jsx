import planQuestions from "../../data/questions/training/plan";
import BasicQuestion from './BasicQuestion'

export default function PlanPage({ onValidChange, currentUser }) {


    return (
        <BasicQuestion
            onValidChange={onValidChange}
            stage="training"
            step="plan"
            currentUser={currentUser}
            question={planQuestions}
        />
    );
}

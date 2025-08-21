import planQuestions from "../../data/questions/training/plan";
import BasicQuestion from './BasicQuestion'

export default function PlanPage({ onValidChange, uid }) {


    return (
        <BasicQuestion
            onValidChange={onValidChange}
            registryKey="training-plan"
            uid={uid}
            question={planQuestions}
        />
    );
}

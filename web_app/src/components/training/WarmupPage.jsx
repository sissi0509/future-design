import warmupQuestions from "../../data/questions/training/warmup";
import BasicQuestion from './BasicQuestion'

export default function WarmupPage({ onValidChange, uid }) {


    return (
        <BasicQuestion
            onValidChange={onValidChange}
            registryKey="training-warmup"
            uid={uid}
            question={warmupQuestions}
        />
    );
}

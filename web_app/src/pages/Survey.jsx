import { useState } from "react";
import { useAuth } from "../components/User/AuthSetUp";
import Questionnaire from "../components/questions/Questionnaire";
import surveyQuestions from "../data/questions/survey";
import { useAnswersRegistry } from "../context/AnswersRegistry";

export default function Survey({ onSubmit }) {
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;
    const { set, remove } = useAnswersRegistry();
    const [submitting, setSubmitting] = useState(false);

    const key = "survey";

    const handleSubmit = async (answers) => {
        setSubmitting(true);
        try {
            await onSubmit?.(answers);
            remove(key);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Questionnaire
            questions={surveyQuestions}
            title="Survey"
            autosaveKey={uid ? `survey-${uid}` : undefined}
            submitting={submitting}
            onChangeAnswers={(answers) => set(key, { type: "survey", answers })}
            onSubmit={handleSubmit}
        />
    );
}

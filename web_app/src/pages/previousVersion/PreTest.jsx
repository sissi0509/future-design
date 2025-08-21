import { useState } from "react";
import { useAuth } from "../components/User/AuthSetUp";
import Questionnaire from "../components/questions/Questionnaire";
import preTestQuestions from "../data/questions/preTest";
import { useAnswersRegistry } from "../context/AnswersRegistry";


export default function PreTest({ onSubmit }) {
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;
    const { set, remove } = useAnswersRegistry();
    const [submitting, setSubmitting] = useState(false);

    const key = "preTest";

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
            questions={preTestQuestions}
            title="Pre-Test"
            autosaveKey={uid ? `pretest-${uid}` : undefined}
            submitting={submitting}
            onChangeAnswers={(answers) => set(key, { type: "preTest", answers })}
            onSubmit={handleSubmit}
        />
    );
}

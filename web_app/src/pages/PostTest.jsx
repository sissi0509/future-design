import { useState } from "react";
import { useAuth } from "../components/User/AuthSetUp";
import Questionnaire from "../components/questions/Questionnaire";
import postTestQuestions from "../data/questions/postTest";
import { useAnswersRegistry } from "../context/AnswersRegistry";

export default function PostTest({ onSubmit }) {
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;
    const { set, remove } = useAnswersRegistry();
    const [submitting, setSubmitting] = useState(false);

    const key = "postTest";

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
            questions={postTestQuestions}
            title="Post-Test"
            autosaveKey={uid ? `posttest-${uid}` : undefined}
            submitting={submitting}
            onChangeAnswers={(answers) => set(key, { type: "postTest", answers })}
            onSubmit={handleSubmit}
        />
    );
}

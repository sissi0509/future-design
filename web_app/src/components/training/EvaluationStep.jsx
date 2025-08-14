// src/components/training/EvaluationStep.jsx
import { useState } from "react";
import { useAuth } from "../User/AuthSetUp";
import { useAnswersRegistry } from "../../context/AnswersRegistry";
import Questionnaire from "../questions/Questionnaire";
import evaluation from "../../data/questions/training/evaluation"; // { reading, questions }

export default function EvaluationStep({ onComplete }) {
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;
    const { set, remove } = useAnswersRegistry();
    const { reading, questions } = evaluation || {};
    const [submitting, setSubmitting] = useState(false);

    const key = "trainingEvaluation";

    const handleSubmit = async (answers) => {
        setSubmitting(true);
        try {
            await onComplete?.(answers);           // StepPage saves final + flips flag
            remove(key);                           // don't flush on logout anymore
            if (uid) localStorage.removeItem(`training-eval-${uid}`); // optional: clear local draft
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)]">
            {/* LEFT: Reading */}
            <article className="rounded-xl border p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
                {reading ? (
                    <>
                        {reading.heading && (
                            <h3 className="text-lg font-semibold mb-2">{reading.heading}</h3>
                        )}
                        {reading.sections?.map((sec, i) => (
                            <section key={i} className="mt-4">
                                {sec.title && <h4 className="font-medium mb-1">{sec.title}</h4>}
                                {sec.body && (
                                    <p className="text-gray-700 leading-6 whitespace-pre-line">
                                        {sec.body}
                                    </p>
                                )}
                                {Array.isArray(sec.bullets) && sec.bullets.length > 0 && (
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        {sec.bullets.map((b, j) => (
                                            <li key={j}>{b}</li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </>
                ) : (
                    <p className="text-gray-600">Reading content coming soon…</p>
                )}
            </article>

            {/* RIGHT: Questionnaire (sticky on large screens) */}
            <div className="rounded-xl border p-4 lg:p-6 lg:sticky lg:top-4 self-start">
                {Array.isArray(questions) && questions.length > 0 ? (
                    <Questionnaire
                        questions={questions}
                        title="Evaluation"
                        autosaveKey={uid ? `training-eval-${uid}` : undefined} // local draft (same device)
                        submitting={submitting}
                        onChangeAnswers={(answers) =>
                            set(key, { type: "trainingEvaluation", answers })
                        }
                        onSubmit={handleSubmit}
                    />
                ) : (
                    <p className="text-gray-600">Questions coming soon…</p>
                )}
            </div>
        </div>
    );
}

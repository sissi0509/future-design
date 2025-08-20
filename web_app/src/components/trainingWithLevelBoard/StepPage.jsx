// src/pages/training/StepPage.jsx
import { useCallback } from "react";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../User/AuthSetUp";
import { db } from "../../config/Firebase";

import EvaluationStep from "./EvaluationStep";
import RevisionStep from "./RevisionStep";

export default function StepPage({ step, onBackToBoard, onFinishedStep }) {
    const { currentUser } = useAuth();

    // Save the current training sub-step (evaluation | revision)
    const saveTrainingStep = useCallback(
        async (which, answers) => {
            if (!currentUser?.uid) return;
            const uid = currentUser.uid;

            const type =
                which === "evaluation" ? "trainingEvaluation" : "trainingRevision";
            const flagPath =
                which === "evaluation"
                    ? "progress.training.evaluationCompleted"
                    : "progress.training.revisionCompleted";

            await setDoc(
                doc(db, "sessionInfo", uid, "responses", type),
                {
                    type,
                    ...answers,
                    submitted: true,
                    status: "final-submit",
                },
                { merge: true }
            );

            await updateDoc(doc(db, "sessionInfo", uid), { [flagPath]: true });

        },
        [currentUser?.uid]
    );

    const handleComplete = async (answers) => {
        await saveTrainingStep(step, answers);
        onFinishedStep?.();
    };

    const titles = { evaluation: "Evaluation", revision: "Revision" };

    return (
        <div className="mx-auto w-full max-w-screen-2xl px-6 pt-6 pb-28">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">{titles[step] || "Training"}</h2>
                <button
                    type="button"
                    onClick={onBackToBoard}
                    className="px-4 py-2 rounded-xl border hover:bg-gray-50 shrink-0"
                >
                    Back to Level Board
                </button>
            </div>

            {step === "evaluation" && <EvaluationStep onComplete={handleComplete} />}
            {step === "revision" && <RevisionStep onComplete={handleComplete} />}
        </div>
    );
}

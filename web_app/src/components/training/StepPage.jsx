// src/pages/training/StepPage.jsx (or wherever you keep it)
import { useCallback } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../User/AuthSetUp";
import { db } from "../../config/Firebase";

// If you still have these components, drop their old `stage` prop.
// They should call `onComplete(answers)` when the user finishes.
import EvaluationStep from "./EvaluationStep";
import RevisionStep from "./RevisionStep";

export default function StepPage({
    step,                 // "evaluation" | "revision"
    onBackToBoard,        // () => void
    onFinishedStep,       // () => void
}) {
    const { currentUser } = useAuth();

    // Write completion + (optional) answers for the current step
    const markStepComplete = useCallback(
        async (which, answers) => {
            if (!currentUser?.uid) return;

            const ref = doc(db, "sessionInfo", currentUser.uid);

            // Firestore dot-paths for your new two-step schema
            const completedPath =
                which === "evaluation"
                    ? "progress.training.evaluationCompleted"
                    : "progress.training.revisionCompleted";

            const answersPath =
                which === "evaluation"
                    ? "progress.training.evaluationAnswers"
                    : "progress.training.revisionAnswers";

            await updateDoc(ref, {
                [completedPath]: true,
                [answersPath]: answers ?? null,
            });
        },
        [currentUser?.uid]
    );

    const handleComplete = async (answers) => {
        // mark current step done in Firestore
        await markStepComplete(step, answers);
        // return to board (Training listens via onSnapshot and will refresh)
        onFinishedStep?.();
    };

    const titles = {
        evaluation: "Evaluation",
        revision: "Revision",
    };

    return (
        <div className="mx-auto w-full max-w-screen-2xl px-6 pt-6 pb-28">
            {/* Header */}
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

            {/* Body */}
            {step === "evaluation" && <EvaluationStep onComplete={handleComplete} />}
            {step === "revision" && <RevisionStep onComplete={handleComplete} />}
        </div>
    );
}

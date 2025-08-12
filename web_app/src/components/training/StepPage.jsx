import stageInfo from "../../data/questions/training/stageInfo";
import PracticeStep from "./PracticeStep";
import EvaluationStep from "./EvaluationStep";
import RevisionStep from "./RevisionStep";

export default function StepPage({
    stage,             // 1..6
    step,              // "practice" | "evaluation" | "revision" | "final"
    onBackToBoard,
    onFinishedStep,    // (whichStep, answers) => void
}) {
    const handleComplete = (answers) => {
        onFinishedStep?.(step, answers);
    };

    const info = stageInfo[stage] || { title: `Stage ${stage}` };

    return (
        <div className="mx-auto w-full max-w-screen-2xl px-6 pt-6 pb-28">
            {/* title only */}
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">{info.title}</h2>
                <button
                    type="button"
                    onClick={onBackToBoard}
                    className="px-4 py-2 rounded-xl border hover:bg-gray-50 shrink-0"
                >
                    Back to Level Board
                </button>
            </div>

            {/* Body */}
            {step === "practice" && <PracticeStep stage={stage} onComplete={handleComplete} />}
            {step === "evaluation" && <EvaluationStep stage={stage} onComplete={handleComplete} />}
            {step === "revision" && <RevisionStep stage={stage} onComplete={handleComplete} />}
        </div>
    );
}

const STEPS = ["practice", "evaluation", "revision"]; // order matters
const STAGES = [1, 2, 3, 4, 5]; // stage 6 is final

// Single source of truth for tile styles
const TILE_CLASSES = {
    base: "rounded-md px-5 py-3 shadow transition select-none text-center",
    done: "bg-emerald-600 text-white ring-1 ring-emerald-700",
    open: "bg-indigo-600 text-white hover:translate-y-[1px]",
    locked: "bg-gray-200 text-gray-500 cursor-not-allowed",
};

// helper to choose the right variant
function tileClassName({ isDone, isOpen }) {
    if (isDone) return `${TILE_CLASSES.base} ${TILE_CLASSES.done}`;
    if (isOpen) return `${TILE_CLASSES.base} ${TILE_CLASSES.open}`;
    return `${TILE_CLASSES.base} ${TILE_CLASSES.locked}`;
}

export default function LevelBoardModules({
    completed = {},                       // { 1: { practice:true, evaluation:false }, ... }
    onOpen,                               // (stageNum, step) => void
    allowReview = true,                  // if true, finished tiles are clickable for review
}) {
    // check if all steps in a stage are done
    const stageDone = (num) => STEPS.every((s) => completed?.[num]?.[s]);

    // first stage not fully complete
    const firstIncompleteStage = STAGES.find((num) => !stageDone(num));

    // first incomplete step within that stage
    const openStep =
        firstIncompleteStage == null
            ? null
            : STEPS.find((s) => !completed?.[firstIncompleteStage]?.[s]);

    // derive tile state
    const tileState = (num, step) => {
        const isDone = !!completed?.[num]?.[step];
        const isOpen = num === firstIncompleteStage && step === openStep;
        const isLocked = !isDone && !isOpen;
        return { isDone, isOpen, isLocked };
    };

    // final available only when all stages 1–5 done
    const allStagesDone = STAGES.every(stageDone);

    const StageHeader = ({ num }) => (
        <div className="mb-3 text-center text-lg font-semibold text-gray-900">{`Stage ${num}`}</div>
    );

    const Tile = ({ num, step, label }) => {
        const { isDone, isOpen, isLocked } = tileState(num, step);
        const canClick = allowReview ? (isOpen || isDone) : isOpen;

        return (
            <button
                className={tileClassName({ isDone, isOpen })}
                disabled={!canClick}
                onClick={() => canClick && onOpen?.(num, step)}
            >
                <span className="font-semibold">{label}</span>
            </button>
        );
    };

    return (
        <div className="mx-auto max-w-5xl p-6">
            <h2 className="mb-8 text-center text-4xl font-bold">Modules</h2>

            {/* 5 columns, 3 rows */}
            <div className="mb-10 grid grid-cols-5 gap-x-10 gap-y-4">
                {STAGES.map((num) => (
                    <div key={num} className="flex flex-col items-stretch">
                        <StageHeader num={num} />
                        <div className="space-y-4">
                            <Tile num={num} step="practice" label="Practice" />
                            <Tile num={num} step="evaluation" label="Evaluation" />
                            <Tile num={num} step="revision" label="Revision" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Final stage (stage 6) */}
            <button
                className={`w-full rounded-md px-6 py-6 shadow ${allStagesDone
                    ? "bg-amber-400 text-gray-900 hover:translate-y-[1px]"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                disabled={!allStagesDone}
                onClick={() => allStagesDone && onOpen?.(6, "final")}
            >
                <span className="font-medium">Final Stage</span>
            </button>
        </div>
    );
}

export default function LevelBoardModules({
    unlocked = { "0": { practice: true, evaluation: false, revise: false } }, // only Stage1 Practice unlocked by default
    completed = {}, // e.g., { "0": { practice: true } }
    onOpen, // (stageIndex, step: 'practice'|'evaluation'|'revise'|'final') => void
}) {
    const stages = [0, 1, 2, 3, 4]; // stage 0..4; stage 5 is final

    const tileState = (i, step) => {
        const isDone = !!completed?.[i]?.[step];
        const isOpen = !!unlocked?.[i]?.[step];
        return { isDone, isOpen };
    };

    const StageHeader = ({ i }) => (
        <div className="text-center font-medium text-gray-600 mb-2">{`Stage ${i + 1}`}</div>
    );

    const Tile = ({ i, step, label }) => {
        const { isDone, isOpen } = tileState(i, step);
        const base =
            "rounded-md px-5 py-3 shadow transition select-none text-center";
        const stateClass = isDone
            ? "bg-blue-600 text-white ring-1 ring-blue-700"
            : isOpen
                ? "bg-blue-400 text-white hover:translate-y-[1px]"
                : "bg-gray-200 text-gray-500 cursor-not-allowed";

        return (
            <button
                className={`${base} ${stateClass}`}
                disabled={!isOpen}
                onClick={() => isOpen && onOpen?.(i, step)}
            >
                <span className="font-semibold">{label}</span>
            </button>
        );
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-4xl font-bold text-center mb-8">Modules</h2>

            {/* 5 columns, 3 rows */}
            <div className="grid grid-cols-5 gap-x-10 gap-y-4 mb-10">
                {stages.map((i) => (
                    <div key={i} className="flex flex-col items-stretch">
                        <StageHeader i={i} />
                        <div className="space-y-4">
                            <Tile i={i} step="practice" label="Practice" />
                            <Tile i={i} step="evaluation" label="Evaluation" />
                            <Tile i={i} step="revise" label="Revise" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Final stage bar */}
            <button
                className="w-full bg-yellow-300 text-gray-900 rounded-md px-6 py-6 shadow
                   disabled:bg-gray-200 disabled:text-gray-500"
                disabled={!unlocked?.final}
                onClick={() => unlocked?.final && onOpen?.(5, "final")}
            >
                <span className="font-medium">Final stage</span>
            </button>
        </div>
    );
}

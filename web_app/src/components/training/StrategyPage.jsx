import strategyQuestions from "../../data/questions/training/strategy";
import BasicQuestion from './BasicQuestion'
import instructionContent from "../../data/questions/training/instruction";

export default function StrategyPage({ onValidChange, currentUser }) {
    const instructions = instructionContent.table.rows.flat();
    const title = instructionContent.table.title;

    return (
        <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="carousel w-full mt-4">
                {instructions.map((inst, i) => (
                    <div id={`item${i + 1}`} key={i} className="carousel-item w-full">
                        <div className="p-6 bg-gray-100 rounded-lg shadow-md mx-4">
                            <h3 className="text-lg font-semibold mb-2">{inst.title}</h3>
                            <p className="text-gray-700">{inst.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex w-full justify-center gap-2 py-2 mb-4">
                {instructions.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        className="btn btn-xs"
                        onClick={() => {
                            document
                                .getElementById(`item${i + 1}`)
                                ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <BasicQuestion
                onValidChange={onValidChange}
                stage="training"
                step="strategy"
                currentUser={currentUser}
                question={strategyQuestions}
            />

        </div >
    );
}

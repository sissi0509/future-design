export default function PlanPage({ onSubmit, onNext, withAI }) {
    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold">PlanPage</h2>

            <div className="flex gap-2">
                <button className="btn" onClick={() => onSubmit({})}>Continue</button>
            </div>
        </div>
    );
}
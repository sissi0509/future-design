export default function LevelBoard({
    instructions,               // { title, description, bullets?, submitLabel? }
    items = [],                 // [{ id, label, done }]
    onSelect,                   // (id) => void
    onSubmit,                   // () => void
    canSubmit = false,
}) {
    const { title, description, bullets = [], submitLabel = "Submit" } = instructions || {};

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            {/* Instructions */}
            <div>
                {title && <h2 className="text-2xl font-semibold mb-2">{title}</h2>}
                {description && <p className="text-sm opacity-80">{description}</p>}
                {bullets.length > 0 && (
                    <ul className="list-disc ml-6 mt-2 text-sm opacity-80 space-y-1">
                        {bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                )}
            </div>

            {/* Checklist */}
            <div className="rounded-xl border p-4">
                <ul className="space-y-3">
                    {items.map((it) => (
                        <li key={it.id}>
                            <button
                                type="button"
                                className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition
                            ${it.done ? "border-green-400" : "border-base-200"}
                            hover:bg-base-200`}
                                disabled={it.done}
                                onClick={() => onSelect?.(it.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border 
                               ${it.done ? "bg-green-500 border-green-500" : "bg-transparent border-base-300"}`}
                                        aria-hidden
                                    >
                                        {it.done ? "✓" : ""}
                                    </span>
                                    <span className="font-medium">{it.label}</span>
                                </div>
                                <span className={`text-sm ${it.done ? "text-green-600" : "text-gray-400"}`}>
                                    {it.done ? "Completed" : "Not completed"}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
                <button
                    type="button"
                    className={`btn btn-primary ${!canSubmit ? "btn-disabled" : ""}`}
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    title={!canSubmit ? "Complete both steps to submit" : submitLabel}
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
}

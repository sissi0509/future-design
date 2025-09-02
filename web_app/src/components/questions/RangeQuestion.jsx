
import ReadAloudButton from '../ReadAloudButton'

export default function RangeQuesion({
    label,
    value,
    rangeMin,
    rangeMax,
    rangeStep,
    onChange,
    onClick,
    startLabel,
    endLabel
}) {


    const labelParts = Array.isArray(label) ? label : [label];
    const speechText = labelParts.join("\n\n");

    const percent = Math.min(
        100,
        Math.max(0, ((value - rangeMin) / (rangeMax - rangeMin)) * 100)
    );


    return (
        <div>
            <div className="space-y-3">
                {labelParts.map((part, i) => (
                    <p key={i} className="whitespace-pre-line leading-relaxed text-justify">
                        {part}
                    </p>
                ))}
                <ReadAloudButton onClick={onClick} text={speechText} />
            </div>


            <div className="relative w-full max-w-2xl mt-12">
                <div
                    className="absolute -top-4 pointer-events-none"
                    style={{ left: `calc(${percent}% )`, transform: "translateX(-50%)" }}
                    aria-live="polite"
                >
                    <div className="tooltip tooltip-open tooltip-info" data-tip={value}>
                    </div>
                </div>
                <input
                    type="range"
                    min={rangeMin}
                    max={rangeMax}
                    value={value}
                    className="range block w-full text-blue-300 [--range-bg:blue] [--range-thumb:blue] "
                    step={rangeStep}
                    onChange={(e) => onChange(Number(e.target.value))}
                />
                <div className="mt-2 flex justify-between text-xs">
                    <span className="whitespace-nowrap">{startLabel}</span>
                    <span className="whitespace-nowrap">{endLabel}</span>
                </div>
            </div>
        </div>
    );
}
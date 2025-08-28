import ReadAloudButton from '../ReadAloudButton'

const DEFAULT_LIKERT = [
    'Strongly agree',
    'Agree',
    'Neutral',
    'Disagree',
    'Strongly disagree',
];

export default function MultipleChoice({
    label,
    qkey,
    options,
    value,
    onChange,
    kind = 'single',
    questions,
    onToggle, //multi-choice inputs
    onSelect, //For single-choice inputs
    onClick,
}) {
    const groupName = qkey;
    const opts = (kind === "likert" && (!options || options.length === 0))
        ? DEFAULT_LIKERT
        : (options || []);



    const labelParts = Array.isArray(label) ? label : [label];
    const labelText = labelParts.join("\n\n");
    const speechText = `${labelText}. Options are: ${opts.join(', ')}`;



    const handleRadio = (opt) => {
        onChange?.(opt);
        onSelect?.(opt);
    };

    const toggleMulti = (opt) => {
        const current = Array.isArray(value) ? value : [];
        const isOn = current.includes(opt);
        const next = isOn ? current.filter(v => v !== opt) : [...current, opt];
        if (!isOn) return;
        onChange?.(next);
        onToggle?.(opt, !isOn);
    };


    return (
        <div>
            <div className="block font-medium mb-2">
                {label}
                <ReadAloudButton onClick={onClick} text={speechText} />
            </div>

            {kind === "likert" && (
                <div className="flex flex-wrap gap-3">
                    {opts.map((opt) => (
                        <label key={opt} className="inline-flex items-center gap-2">
                            <input
                                type="radio"
                                name={groupName}
                                value={opt}
                                checked={value === opt}
                                onChange={() => handleRadio(opt)}
                            />
                            <span className="text-sm">{opt}</span>
                        </label>
                    ))}
                </div>
            )}


            {kind === "single" && (
                <div className="space-y-2">
                    {opts.map((opt) => (
                        <label key={opt} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name={groupName}
                                value={opt}
                                checked={value === opt}
                                onChange={() => handleRadio(opt)}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            )}

            {kind === "multi" && (
                <div className="space-y-2">
                    {opts.map((opt) => {
                        const checked = Array.isArray(value) && value.includes(opt);
                        return (
                            <label key={opt} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name={groupName}
                                    value={opt}
                                    checked={checked}
                                    onChange={() => toggleMulti(opt)}
                                />
                                <span>{opt}</span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
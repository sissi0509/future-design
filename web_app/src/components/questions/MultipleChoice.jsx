import ReadAloudButton from '../ReadAloudButton'

const DEFAULT_LIKERT = [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly agree",
];

export default function MultipleChoice({
    label,
    qkey,
    options,
    value,
    onChange,
    kind = 'single',
    minSelect = 1,
    maxSelect = Infinity,
}) {
    const groupName = qkey;
    const opts = (kind === "likert" && (!options || options.length === 0))
        ? DEFAULT_LIKERT
        : (options || []);

    const speechText = `${label}. Options are: ${opts.join(', ')}`;

    const toggleMulti = (opt) => {
        const current = Array.isArray(value) ? value : [];
        const isOn = current.includes(opt);

        if (isOn) {
            onChange(current.filter((v) => v !== opt));
        } else {
            if (maxSelect && current.length >= maxSelect) return;
            onChange([...current, opt]);
        }
    };

    return (
        <div>
            <label className="block font-medium mb-2">
                {label}
                <ReadAloudButton text={speechText} />
            </label>

            {kind === "likert" && (
                <div className="flex flex-wrap gap-3">
                    {opts.map((opt) => (
                        <label key={opt} className="inline-flex items-center gap-2">
                            <input
                                type="radio"
                                name={groupName}
                                value={opt}
                                checked={value === opt}
                                onChange={() => onChange(opt)}
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
                                onChange={() => onChange(opt)}
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
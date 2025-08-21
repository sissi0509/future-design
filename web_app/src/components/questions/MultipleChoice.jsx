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
    minSelect = 1,
    maxSelect = Infinity,
    questions,
}) {
    const groupName = qkey;
    const opts = (kind === "likert" && (!options || options.length === 0))
        ? DEFAULT_LIKERT
        : (options || []);



    const labelParts = Array.isArray(label) ? label : [label];
    const labelText = labelParts.join("\n\n");
    const speechText =
        kind === 'likert-multi' && questions.length
            ? `${labelText}. ` +
            questions
                .map((q, i) => {
                    return `${i + 1}: ${q.label}. Options are: ${q.options.join(', ')}`;
                })
                .join(' ')
            : `${labelText}. Options are: ${opts.join(', ')}`;

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
            <div className="block font-medium mb-2">
                {label}
                <ReadAloudButton text={speechText} />
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
                                onChange={() => onChange(opt)}
                            />
                            <span className="text-sm">{opt}</span>
                        </label>
                    ))}
                </div>
            )}

            {kind === 'likert-multi' && Array.isArray(questions) && (
                <div className="space-y-5">
                    {questions.map((q, i) => {
                        const rowKey = q.key ?? String(i); // derive a stable key if none provided
                        const name = `${groupName}__${rowKey}`;
                        const current =
                            value && typeof value === 'object' ? value[rowKey] : '';

                        return (
                            <div key={rowKey} className="flex flex-wrap items-center gap-y-3">
                                <div className="min-w-[12rem] font-medium">{q.label}</div>
                                <div className='flex flex-wrap gap-x-6 gap-y-2'>
                                    {q.options.map((opt) => (
                                        <label key={opt} className="inline-flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={name}
                                                value={opt}
                                                checked={current === opt}
                                                onChange={() => onChange({ ...(value || {}), [rowKey]: opt })}
                                            />
                                            <span className="text-sm">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
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
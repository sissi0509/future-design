import ReadAloudButton from '../ReadAloudButton'

export default function MultipleChoiceQuestion({ label, options, value, onChange }) {

    const speechText = `${label}. Options are: ${options.join(', ')}`
    return (
        <div>
            <label className="block font-medium mb-2">
                {label}
                <ReadAloudButton text={speechText} />
            </label>
            <div className="space-y-2">
                {options.map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                        <input
                            type="radio"
                            name={label}
                            value={opt}
                            checked={value === opt}
                            onChange={() => onChange(opt)}
                        />
                        <span>{opt}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
export default function MultipleChoiceQuestion({ label, options, value, onChange, required }) {
    return (
        <div>
            <label className="block font-medium mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
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
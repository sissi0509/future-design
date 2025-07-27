export default function TextQuestion({
    label,
    value,
    onChange,
    placeholder = '',
    minWords = 0,
    maxWords = Infinity,
}) {
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const valid = wordCount >= minWords && wordCount <= maxWords;

    return (
        <div>
            <label className="block font-medium mb-1">
                {label}

            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="textarea w-full"
                rows={4}
                placeholder={placeholder}
            />
            <div className={`text-sm mt-1 ${valid ? 'text-green-600' : 'text-red-500'
                }`}>
                Word count: {wordCount}
                {minWords > 0 && ` (min: ${minWords}`}
                {maxWords < Infinity && `, max: ${maxWords})`}
            </div>
        </div>
    );
}

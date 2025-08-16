import { useRef } from 'react'
import ReadAloudButton from '../ReadAloudButton'
import { insertTextAt, SpeechToTextButton } from '../SpeechToText'

export default function TextQuestion({
    label,
    value,
    onChange,
    placeholder = '',
    minWords = 0,
    maxWords = Infinity,
}) {
    const textareaRef = useRef(null);
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const valid = wordCount >= minWords && wordCount <= maxWords;
    const speechText = label;

    return (
        <div>
            <label className="block font-medium mb-1">
                {label}
                <ReadAloudButton text={speechText} />


            </label>
            <div className="relative w-full">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="textarea w-full"
                    rows={4}
                    placeholder={placeholder}
                />
                <div className="absolute right-2 bottom-2">
                    <SpeechToTextButton onResult={(spoken) =>
                        insertTextAt(textareaRef.current, value, spoken, onChange)
                    } />
                </div>
            </div>
            <div className={`text-sm mt-1 ${valid ? 'text-green-600' : 'text-red-500'
                }`}>
                Word count: {wordCount}
                {minWords > 0 && ` (min: ${minWords}`}
                {maxWords < Infinity && `, max: ${maxWords})`}
            </div>
        </div>
    );
}

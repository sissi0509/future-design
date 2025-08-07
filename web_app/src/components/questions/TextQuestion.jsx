import { useRef } from 'react'
import ReadAloudButton from '../ReadAloudButton'
import SpeechToTextButton from '../SpeechToText'

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

    const handleSpeechResult = (spokenText) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = value.slice(0, start);
        const after = value.slice(end);

        const newValue = before + spokenText + after;
        onChange(newValue);

        // Move cursor to just after inserted text
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + spokenText.length, start + spokenText.length);
        }, 0);
    };
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
                    <SpeechToTextButton onResult={handleSpeechResult} />
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

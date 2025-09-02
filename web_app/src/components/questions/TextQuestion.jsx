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
    onKeyDown,
    onClick,
    logSystemGenerated
}) {
    const textareaRef = useRef(null);
    // check word count and show the word count at button if needed.
    // const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    // const valid = wordCount >= minWords && wordCount <= maxWords;


    const labelParts = Array.isArray(label) ? label : [label];
    const speechText = labelParts.join("\n\n");
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

            <div className="relative w-full mt-4">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="textarea w-full"
                    rows={8}
                    placeholder={placeholder}
                    onKeyDown={onKeyDown}
                />
                <div className="absolute right-2 bottom-2">
                    <SpeechToTextButton logSystemGenerated={logSystemGenerated} onClick={onClick} onResult={(spoken) =>
                        insertTextAt(textareaRef.current, value, spoken, onChange)
                    } />
                </div>
            </div>
            {/* <div className={`text-sm mt-1 ${valid ? 'text-green-600' : 'text-red-500'
                }`}>
                Word count: {wordCount}
                {minWords > 0 && ` (min: ${minWords}`}
                {maxWords < Infinity && `, max: ${maxWords})`}
            </div> */}
        </div>
    );
}

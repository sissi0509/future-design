import { useState } from 'react';

export function insertTextAt(textarea, currentValue, spokenText, onChange) {
    if (!textarea) return;

    textarea.focus();

    const start = textarea.selectionStart ?? currentValue.length;
    const end = textarea.selectionEnd ?? currentValue.length;

    const before = currentValue.slice(0, start);
    const after = currentValue.slice(end);

    const newValue = before + spokenText + after;
    onChange(newValue);

    // place caret right after inserted text (after React updates DOM)
    setTimeout(() => {
        textarea.focus();
        const caret = start + spokenText.length;
        textarea.setSelectionRange(caret, caret);
    }, 0);
}

export function SpeechToTextButton({ logSystemGenerated, onClick, onResult, className = '' }) {
    const [isListening, setIsListening] = useState(false);

    const handleClick = () => {
        onClick?.('btn-speechToText', 'speak')
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { alert("Speech recognition is not supported in this browser."); return; }

        const rec = new SpeechRecognition();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onstart = () => setIsListening(true);

        rec.onresult = (e) => {
            const transcript = e?.results?.[0]?.[0]?.transcript ?? '';
            if (transcript.trim()) {
                logSystemGenerated?.('speech-to-text', transcript);
                onResult(transcript);
            }
            setIsListening(false);
        };

        rec.onerror = () => { alert("Speech recognition failed. Please try again."); setIsListening(false); };
        rec.onend = () => setIsListening(false);

        rec.start();
    };

    return (
        <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClick}
            className={`btn btn-xs btn-outline ml-2 ${className}`}
        >
            {isListening ? 'Listening...' : '🎤 Speak'}
        </button>
    );
}

import { useState } from 'react';

export default function SpeechToTextButton({ onResult, className = '' }) {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');

    const handleClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            alert("Speech recognition failed. Please try again.");
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`btn btn-xs btn-outline ml-2 ${className}`}
        >
            {isListening ? 'Listening...' : '🎤 Speak'}
        </button>
    );
}

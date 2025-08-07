import { useState, useEffect } from 'react';

export default function ReadAloudButton({ text, className = '' }) {
    const [isSpeaking, setIsSpeaking] = useState(false);


    const handleClick = () => {

        if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
            alert(" Your browser does not support text-to-speech.");
            return;
        }

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onend = () => setIsSpeaking(false);

            try {
                window.speechSynthesis.speak(utterance);
                setIsSpeaking(true);
            } catch (err) {
                console.error("Speech error:", err);
                alert("Speech failed to start. It may be blocked by your browser.");
            }
        }
    };


    useEffect(() => {
        return () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return (
        <button
            onClick={handleClick}
            type='button'
            className={`btn btn-xs btn-outline ml-2 ${className}`}
        >
            {isSpeaking ? '⏹️ Stop' : '📖 Read'}
        </button>
    );
}

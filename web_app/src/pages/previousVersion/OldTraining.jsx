import { useState, useEffect } from 'react';
import { useAuth } from '../components/User/AuthSetUp';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';
import { logClientError } from '../services/errorHandle/logClientError';
import TextQuestion from '../components/questions/TextQuestion';
import MultipleChoice from '../components/questions/MultipleChoice'
import trainingQuestions from '../data/questions/training';
import { AiHint } from '../services/aiApi/Gemini';

export default function Training({ onComplete }) {
    const { currentUser } = useAuth();

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [hint, setHint] = useState('');
    const [initialized, setInitialized] = useState(false);

    const storageKey = `trainingAnswer`;

    const current = trainingQuestions[step];

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const { step: savedStep, answers: savedAnswers } = JSON.parse(saved);
                if (typeof savedStep === 'number' && savedStep < trainingQuestions.length) setStep(savedStep);
                if (savedAnswers) setAnswers(savedAnswers);
            } catch (e) {
                console.warn('Failed to load local data:', e);
            }
        }
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (!initialized) return;
        localStorage.setItem(storageKey, JSON.stringify({ step, answers }));
    }, [step, answers, initialized]);


    const wordCount = (text) => {
        return text ? text.trim().split(/\s+/).length : 0;
    }

    const isValid = (q, v) => {
        if (q.type === 'text') {
            const count = wordCount(v);
            return count >= q.minWords && count <= q.maxWords;
        }
        if (q.type === 'multiple') {
            return !!v;
        }
        return false;
    };


    const handleAiHint = async () => {
        if (current.type !== 'text') {
            setError('AI hints are only available for text questions.');
            return;
        }
        const response = answers[current.key] || '';
        if (!response) {
            setError('Please provide an answer before requesting a hint.');
            return;
        }
        setHint('loading...');
        try {
            const generatedHint = await AiHint(current.label, response);
            if (!generatedHint) {
                setError('Failed to get AI hint. Please try again later.');
                return;
            }
            setHint(generatedHint);
            setError('');
        } catch (err) {
            console.error('AI hint error:', err);
            await logClientError({
                error: err,
                source: 'training',
                reason: 'Failed to get AI hint'
            });
            setError('Failed to get AI hint. Please try again later.');
        }
    };

    const handleChange = (key, value) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();


        const lastQuestion = trainingQuestions[trainingQuestions.length - 1];
        if (!isValid(lastQuestion, answers[lastQuestion.key])) {
            alert('Please complete the last question before submitting!');
            return;
        }

        try {
            setLoading(true);

            await addDoc(collection(db, 'sessionInfo', currentUser.uid, 'responses'), {
                type: 'training',
                ...answers,
            });

            await updateDoc(doc(db, 'sessionInfo', currentUser.uid), {
                trainingCompleted: true
            });

            setSubmitted(true);
            if (onComplete) onComplete();
        } catch (err) {
            console.error(`training error:`, err);
            await logClientError({
                error: err,
                source: 'training',
                reason: `Failed to save training`
            });
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Training</h1>

            {!submitted && (
                <>
                    {current.type === 'text' && (
                        <>
                            <TextQuestion
                                label={current.label}
                                value={answers[current.key] || ''}
                                onChange={(val) => handleChange(current.key, val)}
                                minWords={current.minWords}
                                maxWords={current.maxWords}
                            />
                            {hint && (
                                <div className="text-sm text-blue-600 mt-2 border border-blue-200 bg-blue-50 p-3 rounded">
                                    <strong>Hint:</strong> {hint}
                                </div>
                            )}
                        </>
                    )}

                    {current.type === 'multiple' && (
                        <MultipleChoice
                            label={current.label}
                            options={current.options}
                            value={answers[current.key] || ''}
                            onChange={(val) => handleChange(current.key, val)}
                        />
                    )}

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-between gap-4">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={step === 0}
                            onClick={() => { setStep(step - 1), setHint('') }}
                        >
                            Back
                        </button>

                        {current.type === 'text' &&
                            <button
                                type="button"
                                className="btn btn-info"
                                onClick={() => handleAiHint()}
                            >
                                AI Hint
                            </button>
                        }

                        {step < trainingQuestions.length - 1 ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => { setStep(step + 1), setHint('') }}
                                disabled={!isValid(current, answers[current.key])}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn btn-success"
                                disabled={!isValid(current, answers[current.key]) || loading}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        )}
                    </div>
                </>
            )}

            {submitted && (
                <div className="text-green-600 text-center font-semibold mt-4">
                    Pre-Test submitted! You may now continue.
                </div>
            )}
        </form>
    );
}


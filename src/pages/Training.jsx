import { useState } from 'react';
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
    const [allValid, setAllValid] = useState(false);
    const [hint, setHint] = useState('');


    const current = trainingQuestions[step];

    const wordCount = (text) => {
        return text ? text.trim().split(/\s+/).length : 0;
    }

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
        setAnswers((prev) => {
            const updated = { ...prev, [key]: value };

            const isValidStepWithOverride = (q) => {
                const v = updated[q.key];
                if (q.type === 'text') {
                    const count = wordCount(v);
                    return count >= q.minWords && count <= q.maxWords;
                }
                if (q.type === 'multiple') {
                    return !!v;
                }
                return false;
            };

            const allNowValid = trainingQuestions.every(isValidStepWithOverride);
            setAllValid(allNowValid);

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!allValid) {
            return;
        }

        try {
            setLoading(true);

            await addDoc(collection(db, 'users', currentUser.uid, 'responses'), {
                type: 'training',
                ...answers,
            });

            await updateDoc(doc(db, 'users', currentUser.uid), {
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

                    {!allValid && <p className="text-red-500 text-sm">Please complete all to submit!</p>}
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
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn btn-success"
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


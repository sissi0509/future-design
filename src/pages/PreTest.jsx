import { useState } from 'react';
import { useAuth } from '../components/User/AuthSetUp';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';
import { logClientError } from '../services/errorHandle/logClientError';
import TextQuestion from '../components/questions/TextQuestion';
import MultipleChoice from '../components/questions/MultipleChoice'
import preTestQuestions from '../data/questions/preTest';

export default function PreTest({ onComplete }) {
    const { currentUser } = useAuth();

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const current = preTestQuestions[step];

    const wordCount = (text) => {
        return text ? text.trim().split(/\s+/).length : 0;
    }

    const isValidStep = (q) => {
        const value = answers[q.key];
        if (q.type === 'text') {
            const count = wordCount(value);
            return count >= q.minWords && count <= q.maxWords;
        }
        if (q.type === 'multiple') {
            return !!value;
        }
        return false;
    };

    const handleChange = (key, value) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const allValid = preTestQuestions.every(isValidStep);
        if (!allValid) {
            setError('Please complete all questions before submitting.');
            return;
        }

        try {
            setLoading(true);

            await addDoc(collection(db, 'users', currentUser.uid, 'responses'), {
                type: 'preTest',
                ...answers,
            });

            await updateDoc(doc(db, 'users', currentUser.uid), {
                preTestCompleted: true
            });

            setSubmitted(true);
            if (onComplete) onComplete();
        } catch (err) {
            console.error('PreTest error:', err);
            await logClientError({
                error: err,
                source: 'PreTest',
                reason: 'Failed to save preTest'
            });
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Pre-Test</h1>

            {!submitted && (
                <>
                    {current.type === 'text' && (
                        <TextQuestion
                            label={current.label}
                            value={answers[current.key] || ''}
                            onChange={(val) => handleChange(current.key, val)}
                            minWords={current.minWords}
                            maxWords={current.maxWords}
                        />
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
                            onClick={() => setStep(step - 1)}
                        >
                            Back
                        </button>

                        {step < preTestQuestions.length - 1 ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setStep(step + 1)}
                            // disabled={!isValidStep(current)}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn btn-success"
                            // disabled={loading || !isValidStep(current)}
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


import { useState, useEffect } from 'react';
import { useAuth } from '../User/AuthSetUp';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/Firebase';
import { logClientError } from '../../services/errorHandle/logClientError';
import TextQuestion from './TextQuestion';
import MultipleChoice from './MultipleChoice';

export default function Questionnaire({ questions, onComplete, label, collectionType, userField }) {
    const { currentUser } = useAuth();

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitVisible, setSubmitVisible] = useState(false);
    const [initialized, setInitialized] = useState(false); 

    const current = questions[step];
    const isLast = step === questions.length - 1;

    const storageKey = `questionnaire-${collectionType}`;

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const { step: savedStep, answers: savedAnswers } = JSON.parse(saved);
                if (typeof savedStep === 'number' && savedStep < questions.length) setStep(savedStep);
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

    // Control submit button appearance
    useEffect(() => {
        if (isLast) {
            const timer = setTimeout(() => setSubmitVisible(true), 500);
            return () => clearTimeout(timer);
        } else {
            setSubmitVisible(false);
        }
    }, [step, questions.length]);

    const wordCount = (text) => (text ? text.trim().split(/\s+/).length : 0);

    const isValid = (q, v) => {
        if (q?.type === 'text') {
            const count = wordCount(v);
            return count >= q.minWords && count <= q.maxWords;
        }
        if (q?.type === 'multiple') {
            return !!v;
        }
        return false;
    };

    const handleChange = (key, value) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            await addDoc(collection(db, 'sessionInfo', currentUser.uid, 'responses'), {
                type: collectionType,
                ...answers,
            });

            await updateDoc(doc(db, 'sessionInfo', currentUser.uid), {
                [userField]: true,
            });

            localStorage.removeItem(storageKey); // ✅ Clear saved answers
            setSubmitted(true);
            if (onComplete) onComplete();
        } catch (err) {
            console.error(`${label} error:`, err);
            await logClientError({
                error: err,
                source: label,
                reason: `Failed to save ${label}`,
            });
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) return null;

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">{`${label} (${questions.length} Questions)`}</h1>

            {!submitted && (
                <>
                    {current?.type === 'text' && (
                        <TextQuestion
                            label={current.label}
                            value={answers[current.key] || ''}
                            onChange={(val) => handleChange(current.key, val)}
                            minWords={current.minWords}
                            maxWords={current.maxWords}
                        />
                    )}

                    {current?.type === 'multiple' && (
                        <MultipleChoice
                            label={current.label}
                            options={current.options}
                            value={answers[current.key] || ''}
                            onChange={(val) => handleChange(current.key, val)}
                        />
                    )}

                    <div className="flex justify-between gap-4">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={step === 0}
                            onClick={() => setStep((prev) => prev - 1)}
                        >
                            Back
                        </button>

                        {!isLast ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={!isValid(current, answers[current.key])}
                                onClick={() => setStep((prev) => prev + 1)}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn btn-success"
                                disabled={!submitVisible || loading}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        )}
                    </div>
                </>
            )}

            {submitted && (
                <div className="text-green-600 text-center font-semibold mt-4">
                    {label} submitted! You may now continue.
                </div>
            )}
        </form>
    );
}

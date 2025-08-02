import { useState } from 'react';
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
    const [allValid, setAllValid] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const current = questions[step];

    const wordCount = (text) => (text ? text.trim().split(/\s+/).length : 0);

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

            const allNowValid = questions.every(isValidStepWithOverride);
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

            await addDoc(collection(db, 'sessionInfo', currentUser.uid, 'responses'), {
                type: collectionType,
                ...answers,
            });

            await updateDoc(doc(db, 'sessionInfo', currentUser.uid), {
                [userField]: true
            });

            setSubmitted(true);
            if (onComplete) onComplete();
        } catch (err) {
            console.error(`${label} error:`, err);
            await logClientError({
                error: err,
                source: label,
                reason: `Failed to save ${label}`
            });
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">{label}</h1>

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
                    {!allValid && <p className="text-red-500 text-sm">Please complete all to submit!</p>}
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

                        {step < questions.length - 1 ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setStep(step + 1)}
                            >
                                Next
                            </button>
                        ) : (
                            <button type="submit" className="btn btn-success">
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

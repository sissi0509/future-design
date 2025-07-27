import { useState } from 'react';
import { useAuth } from '../components/User/AuthSetUp';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/Firebase';
import { logClientError } from '../services/errorHandle/logClientError';
import TextQuestion from '../components/questions/TextQuestion';
import MultipleChoice from '../components/questions/MultipleChoice'

export default function PreTest({ onComplete }) {
    const { currentUser } = useAuth();

    const [step, setStep] = useState(0);
    const [q1, setQ1] = useState('');
    const [q2, setQ2] = useState('');
    const [q3, setQ3] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

    const isStepValid = () => {
        if (step === 0) return wordCount(q1) >= 5 && wordCount(q1) <= 6;
        if (step === 1) return !!q2;
        if (step === 2) return wordCount(q3) >= 20 && wordCount(q3) <= 100;
        return false;
    };

    const handleNext = () => {
        setError('');
        if (!isStepValid()) {
            setError('Please complete the current question.');
            return;
        }
        setStep(step + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!q1 || !q2 || !q3) {
            setError('Please complete all questions.');
            return;
        }

        try {
            setLoading(true);

            const answers = {
                q1,
                q2,
                q3,
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, 'users', currentUser.uid, 'responses'), {
                type: 'preTest',
                ...answers
            });

            await updateDoc(doc(db, 'users', currentUser.uid), {
                preTestCompleted: true
            });

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

            {step === 0 && (
                <TextQuestion
                    label="1. lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?"
                    value={q1}
                    onChange={setQ1}
                    placeholder=''
                    minWords={5}
                    maxWords={6}
                    disabled={!isStepValid()}
                />
            )}

            {step === 1 && (
                <MultipleChoice
                    label="2. Select the most accurate statement about machine learning:"
                    options={[
                        'It learns from data',
                        'It memorizes rules',
                        'It’s always accurate',
                        'It replaces humans'
                    ]}
                    value={q2}
                    onChange={setQ2}
                    required
                />
            )}

            {step === 2 && (
                <TextQuestion
                    label="3. What concerns or hopes do you have about AI?"
                    value={q3}
                    onChange={setQ3}
                    required
                />
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end gap-4">
                {step < 2 ? (
                    <button type="button" onClick={handleNext} className="btn btn-primary">
                        Next
                    </button>
                ) : (
                    <button type="submit" className="btn btn-success" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Pre-Test'}
                    </button>
                )}
            </div>
        </form>
    );
}

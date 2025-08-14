// src/components/questions/Questionnaire.jsx
import { useEffect, useMemo, useState } from "react";
import TextQuestion from "./TextQuestion";
import MultipleChoice from "./MultipleChoice";

/**
 * A reusable, UI-only questionnaire component.
 *
 * Props:
 * - questions: Array<{ key: string, type: 'text' | 'multiple', label: string,
 *                      minWords?: number, maxWords?: number,
 *                      options?: string[], multi?: boolean }>
 * - label?: string                     // Title shown above the form
 * - onSubmit?: (answers: object) => void
 * - initialAnswers?: object            // Preload answers 
 * - autosaveKey?: string               // If set, drafts persist in localStorage
 * - isSubmitting?: boolean             // Parent-controlled "saving…" state
 * - submitText?: string                // Custom text for submit button
 * - onCancel?: () => void              // Optional cancel/back-to-parent handler
 */
export default function Questionnaire({
    questions = [],
    label = "Questions",
    onSubmit,
    initialAnswers = {},
    autosaveKey,
    isSubmitting = false,
    submitText = "Submit",
    onCancel,
}) {

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState(initialAnswers);
    const [initialized, setInitialized] = useState(false);


    const total = questions.length;
    const isLast = step === total - 1;
    const current = useMemo(() => questions[step], [questions, step]);


    useEffect(() => {
        if (!autosaveKey) {
            setInitialized(true);
            return;
        }
        const saved = localStorage.getItem(autosaveKey);
        if (saved) {
            try {
                const { step: savedStep, answers: savedAnswers } = JSON.parse(saved);
                if (typeof savedStep === "number" && savedStep >= 0 && savedStep < total) {
                    setStep(savedStep);
                }
                if (savedAnswers && typeof savedAnswers === "object") {
                    setAnswers(savedAnswers);
                }
            } catch {
                console.warn("Failed to parse autosave data, starting fresh.");
                localStorage.removeItem(autosaveKey); // Clear invalid data
            }
        }
        setInitialized(true);

    }, [autosaveKey, total]);

    useEffect(() => {
        if (!initialized || !autosaveKey) return;
        localStorage.setItem(autosaveKey, JSON.stringify({ step, answers }));
    }, [initialized, autosaveKey, step, answers]);


    const wordCount = (text) => (typeof text === "string" ? text.trim().split(/\s+/).filter(Boolean).length : 0);

    const isValid = (q, v) => {
        if (!q) return false;

        if (q.type === "text") {
            const min = q.minWords ?? 0;
            const max = q.maxWords ?? Infinity;
            const count = wordCount(v);
            return count >= min && count <= max;
        }

        if (q.type === "multiple") {
            return !!v;
        }

        return false;
    };

    const currentAnswer = current ? answers[current.key] : undefined;
    const currentValid = isValid(current, currentAnswer);


    const handleChange = (key, value) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (!currentValid) return;
        setStep((s) => Math.min(s + 1, total - 1));
    };

    const handleBack = () => {
        setStep((s) => Math.max(s - 1, 0));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!currentValid) return;

        if (autosaveKey) localStorage.removeItem(autosaveKey);

        onSubmit?.(answers);
    };

    if (!initialized) return null;

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold">
                    {label} {total > 0 ? `(${total} Questions)` : ""}
                </h1>
                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onCancel}
                        aria-label="Cancel questionnaire"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {total === 0 ? (
                <p className="text-gray-600">No questions available.</p>
            ) : (
                <>
                    {/* Render current question */}
                    {current?.type === "text" && (
                        <TextQuestion
                            label={current.label}
                            value={answers[current.key] ?? ""}
                            onChange={(val) => handleChange(current.key, val)}
                            minWords={current.minWords}
                            maxWords={current.maxWords}
                        />
                    )}

                    {current?.type === "multiple" && (
                        <MultipleChoice
                            label={current.label}
                            options={current.options || []}
                            // Support single- or multi-select based on question.multi
                            value={
                                current.multi
                                    ? Array.isArray(answers[current.key]) ? answers[current.key] : []
                                    : answers[current.key] ?? ""
                            }
                            onChange={(val) => handleChange(current.key, val)}
                            multi={!!current.multi}
                        />
                    )}

                    <div className="flex justify-between gap-4">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleBack}
                            disabled={step === 0}
                        >
                            Back
                        </button>

                        {!isLast ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleNext}
                                disabled={!currentValid}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn btn-success"
                                disabled={isSubmitting || !currentValid}
                            >
                                {isSubmitting ? "Submitting…" : submitText}
                            </button>
                        )}
                    </div>

                    {/* Optional progress indicator */}
                    <div className="text-sm text-gray-500 text-center">
                        Step {step + 1} of {total}
                    </div>
                </>
            )}
        </form>
    );
}

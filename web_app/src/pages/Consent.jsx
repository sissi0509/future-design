import { useState, useRef, useEffect } from "react";
import { logClientError } from "../services/errorHandle/logClientError";
import {
    makeKeydownLogger,
    makeScrollLogger,
    makeFunctionalClickStatement,
    makeOptionToggleStatement,
} from "../services/xapi/eventStatements";
import {
    appendXapiToStage,
    flushStageBundleToGlobalXapi,
} from "../services/xapi/xapiBundles";

import { questions, mainContent } from '../data/consent'

export default function Consent({ currentUser, onComplete }) {
    const [idx, setIdx] = useState(0);                // which question is showing
    const [answers, setAnswers] = useState([]);
    const [error, setError] = useState("");


    const scrollRef = useRef(null);

    const stageId = "consent";
    const stepKeyScroll = "formScroll";

    // log scrolls
    const onScroll = makeScrollLogger({
        user: currentUser,
        stageId,
        stepKey: stepKeyScroll,
        throttleMs: 200,
    });

    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.addEventListener("scroll", onScroll);
        return () => el?.removeEventListener("scroll", onScroll);
    }, [onScroll]);

    const allYes = answers.length === questions.length && answers.every(Boolean);
    const ADVANCE_DELAY_MS = 400; // 300–500ms feels good

    const handleToggle = async (choice) => {
        const q = questions[idx];

        try {
            const stmt = makeOptionToggleStatement({
                user: currentUser,
                stageId,
                stepKey: `q${idx + 1}`,        // e.g., q1, q2, ...
                choiceLabel: q,
                selected: choice,              // true for Yes
            });
            appendXapiToStage(currentUser, stageId, stmt);
        } catch (err) {
            await logClientError({
                error: err,
                source: "Consent handleToggle",
                reason: "Failed to append toggle",
            });
        }

        setAnswers((prev) => {
            const next = [...prev];
            next[idx] = !!choice;
            return next;
        });

        if (choice === true) {
            setError("");
            // small pause so the ✓ is visible, then advance
            setTimeout(() => {
                setIdx((i) => Math.min(i + 1, questions.length - 1)); // NOT length-1
            }, ADVANCE_DELAY_MS);
        } else {
            setError("You must select “Yes” to proceed.");
        }
    };


    // handle submit button click (functional click + flush)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!allYes) return;

        try {
            const stmt = makeFunctionalClickStatement({
                user: currentUser,
                stageId,
                stepKey: "submit",
                controlId: "btn-submit-consent",
                label: "Submit and Continue",
            });
            appendXapiToStage(currentUser, stageId, stmt);
            await flushStageBundleToGlobalXapi({ user: currentUser, stageId });
            onComplete?.();
        } catch (err) {
            setError("Something went wrong. Please try again.");
            await logClientError({
                error: err,
                source: "Consent.handleSubmit",
                reason: "Failed to flush consent bundle",
            });
        }
    };


    return (
        <div className="max-w-3xl mx-auto p-6">
            <img
                src="/Carnegie-Mellon-University-Logo-500x281.png"
                className="w-80"
            />
            <h1 className="text-2xl font-bold mb-4">On-line Consent Form for session 2</h1>


            <div
                ref={scrollRef}
                className="mb-6 border rounded p-4 bg-gray-50 max-h-[500px] overflow-y-auto"
            >
                <p className="text-sm whitespace-pre-wrap">{mainContent}</p>
            </div>

            {idx < questions.length && (
                <div className="mb-4">

                    <p className="mb-4">{questions[idx]}</p>


                    <div className="flex items-center gap-3">
                        {/* NO label (clickable) */}
                        <button
                            type="button"
                            className={`text-sm ${(answers[idx] ?? false) ? "text-base-content/50" : "font-semibold"
                                }`}
                            onClick={() => handleToggle(false)}
                            aria-pressed={!(answers[idx] ?? false)}
                        >
                            No
                        </button>

                        {/* Toggle */}
                        <label className="toggle text-base-content">
                            <input
                                type="checkbox"
                                checked={answers[idx] ?? false}
                                onChange={(e) => handleToggle(e.target.checked)}
                                aria-label={`Answer ${answers[idx] ? "Yes" : "No"}`}
                            />
                            <svg
                                aria-label="disabled"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                            <svg aria-label="enabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" fill="none" stroke="currentColor">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </g>
                            </svg>

                        </label>

                        {/* YES label (clickable) */}
                        <button
                            type="button"
                            className={`text-sm ${(answers[idx] ?? false) ? "font-semibold" : "text-base-content/50"
                                }`}
                            onClick={() => handleToggle(true)}
                            aria-pressed={!!(answers[idx] ?? false)}
                        >
                            Yes
                        </button>
                    </div>

                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <button
                    type="submit"
                    className="btn btn-neutral-content"
                    disabled={!allYes}>
                    Submit and Continue
                </button>
            </form>
        </div>
    );
}

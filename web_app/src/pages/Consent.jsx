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

export default function Consent({ currentUser, onComplete }) {
    const [hasAgreed, setHasAgreed] = useState(false);
    const [typedId, setTypedId] = useState("");
    const [error, setError] = useState("");

    const inputRef = useRef(null);
    const scrollRef = useRef(null);

    const stageId = "consent";
    const stepKeyInput = "prolificId";
    const stepKeyScroll = "formScroll";

    // log keystrokes
    const onKeyDown = makeKeydownLogger({
        user: currentUser,
        stageId,
        stepKey: stepKeyInput,
    });

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

    // handle checkbox click (option toggle)
    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setHasAgreed(checked);

        try {
            const stmt = makeOptionToggleStatement({
                user: currentUser,
                stageId,
                stepKey: "agreeCheckbox",
                choiceLabel: "I Agree",
                selected: checked,
            });
            appendXapiToStage(currentUser, stageId, stmt);
        } catch (err) {
            logClientError({
                error: err,
                source: "Consent.handleCheckboxChange",
                reason: "Failed to append checkbox toggle",
            });
        }
    };

    const isFormValid = hasAgreed && typedId.trim().length > 0;

    // handle submit button click (functional click + flush)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            setError("Please agree and sign with correct ID.");
            return;
        }

        try {
            // log functional click
            const stmt = makeFunctionalClickStatement({
                user: currentUser,
                stageId,
                stepKey: "submit",
                controlId: "btn-submit-consent",
                label: "Submit and Continue",
            });
            appendXapiToStage(currentUser, stageId, stmt);

            // flush all consent-stage statements (keys, scrolls, checkbox, submit)
            await flushStageBundleToGlobalXapi({ user: currentUser, stageId });

            // advance flow
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

    const consentText = ",Consent Form\n\nBy participating in this study, you agree to the following terms:\n\n1. Your participation is voluntary, and you may withdraw at any time without penalty.\n2. Your responses will be kept confidential and used solely for research purposes.\n3. You will not receive any direct benefits from participating in this study.\n4. If you have any questions or concerns, please contact the research team atConsent Form\n\nBy participating in this study, you agree to the following terms:\n\n1. Your participation is voluntary, and you may withdraw at any time without penalty.\n2. Your responses will be kept confidential and used solely for research purposes.\n3. You will not receive any direct benefits from participating in this study.\n4. If you have any questions or concerns, please contact the research team atConsent Form\n\nBy participating in this study, you agree to the following terms:\n\n1. Your participation is voluntary, and you may withdraw at any time without penalty.\n2. Your responses will be kept confidential and used solely for research purposes.\n3. You will not receive any direct benefits from participating in this study.\n4. If you have any questions or concerns, please contact the research team atConsent Form\n\nBy participating in this study, you agree to the following terms:\n\n1. Your participation is voluntary, and you may withdraw at any time without penalty.\n2. Your responses will be kept confidential and used solely for research purposes.\n3. You will not receive any direct benefits from participating in this study.\n4. If you have any questions or concerns, please contact the research team at";

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Consent Form</h1>

            <div
                ref={scrollRef}
                className="mb-6 border rounded p-4 bg-gray-50 max-h-[500px] overflow-y-auto"
            >
                <p className="text-sm whitespace-pre-wrap">{consentText}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        className="mr-2"
                        checked={hasAgreed}
                        onChange={handleCheckboxChange}
                    />
                    Agree
                </label>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Type ID to sign:
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        className="input input-bordered w-full"
                        value={typedId}
                        onChange={(e) => setTypedId(e.target.value)}
                        placeholder="Type your Prolific ID"
                        onKeyDown={onKeyDown}   // logs keystrokes
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button type="submit" className="btn btn-neutral-content">
                    Submit and Continue
                </button>
            </form>
        </div>
    );
}

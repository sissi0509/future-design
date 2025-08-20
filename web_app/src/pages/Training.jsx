import { useEffect, useMemo, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/Firebase";
import { useAuth } from "../components/User/AuthSetUp";
import { logClientError } from "../services/errorHandle/logClientError";

import WarmupPage from "../components/training/WarmupPage";
import GoalPage from "../components/training/GoalPage";
import InstructionPage from "../components/training/InstructionPage";
import StrategyPage from "../components/training/StrategyPage";
import PlanPage from "../components/training/PlanPage";
// import ChatBoxAI from "../components/training/ChatBoxAI";

// --- helpers to read drafts each page writes ---
function storageKey(uid, key) {
    return uid ? `train-${uid}-${key}-draft` : `train-anon-${key}-draft`;
}
function readDraft(uid, key) {
    try {
        const raw = localStorage.getItem(storageKey(uid, key));
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

// Build ordered steps for the given group (AI flag kept if you later re-enable ChatBoxAI)
function buildSteps(group) {
    const g = [1, 2, 3].includes(group) ? group : 2;
    const core = [
        { key: "goal", Comp: GoalPage, ai: g === 3 },
        { key: "instruction", Comp: InstructionPage, ai: g === 3 },
        { key: "strategy", Comp: StrategyPage, ai: g === 3 },
        { key: "plan", Comp: PlanPage, ai: g === 3 },
    ];
    return g === 1 ? core : [{ key: "warmup", Comp: WarmupPage, ai: false }, ...core];
}

export default function Training({ group, onComplete }) {
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    const steps = useMemo(() => buildSteps(group), [group]);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // validity map across all steps, e.g. { warmup: true, goal: false, ... }
    const [validByKey, setValidByKey] = useState({});

    // seed validity map from localStorage whenever user/steps change
    useEffect(() => {
        const seeded = {};
        for (const s of steps) {
            seeded[s.key] = readDraft(uid, s.key)?.isValid === true;
        }
        setValidByKey(seeded);
        setCurrentIdx(0);
    }, [uid, steps]);

    const isFirst = currentIdx === 0;
    const isLast = currentIdx === steps.length - 1;

    const goPrev = () => setCurrentIdx((i) => Math.max(0, i - 1));
    const goNext = () => setCurrentIdx((i) => Math.min(steps.length - 1, i + 1));

    const { key: stepKey, Comp /*, ai*/ } = steps[currentIdx];

    // Combine live validity (for current step) with seeded values (for others)
    const allValid = steps.every((s) => validByKey[s.key] === true);

    // let the current page update its entry in the validity map
    const handleCurrentValidChange = (isValid) => {
        setValidByKey((prev) =>
            prev[stepKey] === isValid ? prev : { ...prev, [stepKey]: !!isValid }
        );
    };

    const handleFinalSubmit = async () => {
        if (!isLast || !allValid || submitting) return;
        setSubmitting(true);
        try {
            for (const s of steps) {
                const draft = readDraft(uid, s.key);
                await setDoc(
                    doc(db, "sessionInfo", uid, "responses", `training-${s.key}`),
                    {
                        type: `training-${s.key}`,
                        answers: draft || {},
                        submitted: true,
                        status: "final-submit",
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                );
            }

            try {
                for (const s of steps) localStorage.removeItem(storageKey(uid, s.key));
            } catch { }

            // Let Home mark progress.training.trainingCompleted = true
            onComplete?.();
        } catch (e) {
            await logClientError({
                error: e,
                source: "Training.finalSubmit",
                reason: "Failed writing final training answers",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!steps.length) return null;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between text-sm opacity-70">
                <div>Step {currentIdx + 1} / {steps.length}</div>
                <div>Group {group}</div>
            </div>

            {/* Page renders inputs, writes { isValid } into its draft, and reports validity here */}
            <Comp onValidChange={handleCurrentValidChange} />

            {/* If you re-enable AI later, Training decides here:
      {ai && uid && (
        <ChatBoxAI
          uid={uid}
          registryKey={`training-${key}`}
          openerText="I’m here to help as you work on this step."
          maxMessagesToSave={200}
        />
      )}
      */}

            <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                    <button className="btn" onClick={goPrev} disabled={isFirst}>‹ Previous</button>
                    <button className="btn" onClick={goNext} disabled={isLast}>Next ›</button>
                </div>

                {isLast && (
                    <button
                        className={`btn ${allValid ? "btn-primary" : "btn-disabled"}`}
                        onClick={handleFinalSubmit}
                        disabled={!allValid || submitting}
                    >
                        {submitting ? "Submitting…" : "Submit"}
                    </button>
                )}
            </div>
        </div>
    );
}

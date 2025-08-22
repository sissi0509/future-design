// src/pages/Training.jsx (or your current path)
import { useEffect, useMemo, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/Firebase";
import { useAuth } from "../components/User/AuthSetUp";
import { logClientError } from "../services/errorHandle/logClientError";
import { useAnswersRegistry } from "../context/AnswersRegistry"

import WarmupPage from "../components/training/WarmupPage";
import GoalPage from "../components/training/GoalPage";
import InstructionPage from "../components/training/InstructionPage";
import StrategyPage from "../components/training/StrategyPage";
import PlanPage from "../components/training/PlanPage";

import ChatBoxAI from "../components/training/ChatBoxAI";
import ResizableSidebar, { useResizableWidth } from "../components/ResizableSidebar";

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

// Build ordered steps for the given group
function buildSteps(group) {
    const g = [1, 2, 3].includes(group) ? group : 2;
    const core = [
        { key: "training-goal", Comp: GoalPage, ai: g === 3 },
        { key: "training-instruction", Comp: InstructionPage, ai: g === 3 },
        { key: "training-strategy", Comp: StrategyPage, ai: g === 3 },
        { key: "training-plan", Comp: PlanPage, ai: g === 3 },
    ];
    return g === 1 ? core : [{ key: "training-warmup", Comp: WarmupPage, ai: false }, ...core];
}

const MIN = 18 * 16;
const MAX = 64 * 16;

export default function Training({ group, onComplete }) {
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    const steps = useMemo(() => buildSteps(group), [group]);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // validity map across all steps, e.g. { "training-warmup": true, ... }
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

    const { key: stepKey, Comp, ai } = steps[currentIdx];

    // Combine live validity (for current step) with seeded values (for others)
    const allValid = steps.every((s) => validByKey[s.key] === true);

    // let the current page update its entry in the validity map
    const handleCurrentValidChange = (isValid) => {
        setValidByKey((prev) =>
            prev[stepKey] === isValid ? prev : { ...prev, [stepKey]: !!isValid }
        );
    };

    // --- AI sidebar state (always set up; only rendered when ai && group===3 && uid) ---
    const [collapsed, setCollapsed] = useState(false);
    const { width, startResize } = useResizableWidth({
        initial: 28 * 16,
        min: MIN,
        max: MAX,
    });
    const aiEnabled = !!uid && ai === true; // only for group 3 steps (except warmup per buildSteps)

    const { remove: regRemove } = useAnswersRegistry();
    const handleFinalSubmit = async () => {
        if (!isLast || !allValid || submitting) return;

        if (!uid) {
            await logClientError({
                error: "No UID at submit",
                source: "Training.finalSubmit",
                reason: "User not logged in at submit",
            });
            alert("Please log in before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            for (const s of steps) {
                const draft = readDraft(uid, s.key) || {};
                await setDoc(
                    doc(db, "sessionInfo", uid, "responses", s.key),
                    {
                        type: s.key,
                        ...draft,
                        submitted: true,
                        draft: false,
                        status: "final-submit",
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                );
            }

            try {
                for (const s of steps) localStorage.removeItem(storageKey(uid, s.key));
            } catch { }

            try {
                for (const s of steps) regRemove(s.key);
            } catch { }

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
        <div className="mx-auto w-full max-w-screen-2xl px-6 pt-6 pb-28">
            <div className="border rounded-xl overflow-hidden h-[85vh]">
                <div className="relative flex h-full">
                    {/* LEFT: step content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        {/* top bar */}
                        <div className="px-4 py-3 border-b bg-base-100 flex items-center justify-between">
                            <div className="text-sm opacity-70">
                                Step {currentIdx + 1} / {steps.length}
                            </div>

                            {aiEnabled && (
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => setCollapsed((c) => !c)}
                                    title={collapsed ? "Show AI Coach" : "Hide AI Coach"}
                                >
                                    {collapsed ? "Show Coach" : "Hide Coach"}
                                </button>
                            )}
                        </div>

                        {/* scrollable step body */}
                        <div className="p-6 flex-1 overflow-auto">
                            <Comp onValidChange={handleCurrentValidChange} uid={uid} />
                        </div>

                        {/* bottom bar: nav + submit */}
                        <div className="px-6 py-4 border-t flex items-center justify-between">
                            <div className="flex gap-2">
                                <button className="btn" onClick={goPrev} disabled={isFirst}>
                                    ‹ Previous
                                </button>
                                <button className="btn" onClick={goNext} disabled={isLast}>
                                    Next ›
                                </button>
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

                    {/* RIGHT: AI Coach (only for group 3 steps except warmup) */}
                    {aiEnabled && (
                        <ResizableSidebar
                            width={width}
                            min={MIN}
                            max={MAX}
                            collapsed={collapsed}
                            onResizeStart={startResize}
                        >
                            <ChatBoxAI
                                title="AI Coach"
                                registryKey={stepKey}   // e.g., "training-goal", "training-plan"
                                uid={uid}
                                group={group}          // your ChatBox can use this to set the system prompt
                            />
                        </ResizableSidebar>
                    )}
                </div>
            </div>
        </div>
    );
}

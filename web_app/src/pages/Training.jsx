// src/pages/Training.jsx
import { useEffect, useMemo, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/Firebase";
import { logClientError } from "../services/errorHandle/logClientError";
import { sendAnswerStatement, sendConversationTranscript } from "../services/xapi/AnswersStatement";
import { flushStageBundleToGlobalXapi } from '../services/xapi/xapiBundles';
import { makeClickLogger, makeKeydownLogger, makeSystemGeneratedLogger, makeResizeLogger, makeScrollLogger } from '../services/xapi/eventStatements';

import WarmupPage from "../components/training/WarmupPage";
import GoalPage from "../components/training/GoalPage";
import InstructionPage from "../components/training/InstructionPage";
import StrategyPage from "../components/training/StrategyPage";
import PlanPage from "../components/training/PlanPage";

import ChatBoxAI from "../components/training/ChatBoxAI";
import { buildFullTranscript } from "../components/training/chatboxSetup/chatUtils";
import ResizableSidebar, { useResizableWidth } from "../components/ResizableSidebar";

function storageKey(uid, key) { return uid ? `train-${uid}-${key}-draft` : `train-anon-${key}-draft`; }

function readDraft(uid, key) {
    try { const raw = localStorage.getItem(storageKey(uid, key)); return raw ? JSON.parse(raw) : {}; }
    catch { return {}; }
}

const STAGE_ID = 'training';
const MIN = 18 * 16;
const MAX = 64 * 16;

export default function Training({ currentUser, group, onComplete }) {
    const uid = currentUser?.uid;
    const CHAT_STORAGE_ID = `chat-trainingAiConversation-${uid ?? 'anon'}`;

    // Build ordered steps
    const steps = useMemo(() => {
        const g = [1, 2, 3].includes(group) ? group : 2;
        const core = [
            { key: "training-goal", Comp: GoalPage, ai: g === 3 },
            { key: "training-instruction", Comp: InstructionPage, ai: g === 3 },
            { key: "training-strategy", Comp: StrategyPage, ai: g === 3 },
            { key: "training-plan", Comp: PlanPage, ai: g === 3 },
        ];
        return g === 1 ? core : [{ key: "training-warmup", Comp: WarmupPage, ai: false }, ...core];
    }, [group]);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [validByKey, setValidByKey] = useState({});

    useEffect(() => {
        const seeded = {};
        for (const s of steps) seeded[s.key] = readDraft(uid, s.key)?.isValid === true;
        setValidByKey(seeded);
        setCurrentIdx(0);
    }, [uid, steps]);

    const isFirst = currentIdx === 0;
    const isLast = currentIdx === steps.length - 1;
    const goPrev = () => setCurrentIdx(i => Math.max(0, i - 1));
    const goNext = () => setCurrentIdx(i => Math.min(steps.length - 1, i + 1));

    const { key: stepKey, Comp, ai } = steps[currentIdx];
    const allValid = steps.every(s => validByKey[s.key] === true);

    const handleCurrentValidChange = (isValid) => {
        setValidByKey(prev => prev[stepKey] === isValid ? prev : { ...prev, [stepKey]: !!isValid });
    };

    // loggers
    const buildLoggerBundle = (user, stageId, stepKey) => ({
        onKeyDown: makeKeydownLogger({ user, stageId, stepKey }),
        logClick: makeClickLogger({ user, stageId, stepKey }),
        logSystemGenerated: makeSystemGeneratedLogger({ user, stageId, stepKey }),
    });
    const baseLogger = useMemo(() => buildLoggerBundle(currentUser, STAGE_ID, stepKey), [currentUser, stepKey]);
    const aiLogger = useMemo(() => buildLoggerBundle(currentUser, STAGE_ID, `${stepKey}-AiChatBox`), [currentUser, stepKey]);
    const logScrollTraining = useMemo(
        () => makeScrollLogger({ user: currentUser, stageId: STAGE_ID, stepKey: `${stepKey}-TrainingSection`, throttleMs: 200 }),
        [currentUser, stepKey]);
    const logScrollStepBody = useMemo(
        () => makeScrollLogger({ user: currentUser, stageId: STAGE_ID, stepKey: `${stepKey}-StepBody`, throttleMs: 200 }),
        [currentUser, stepKey]);
    const logScrollAI = useMemo(
        () => makeScrollLogger({ user: currentUser, stageId: STAGE_ID, stepKey: `${stepKey}-AiChatBox`, throttleMs: 200 }),
        [currentUser, stepKey]);
    const logResize = useMemo(
        () => makeResizeLogger({ user: currentUser, stageId: STAGE_ID, stepKey: `${stepKey}-AiSidebar` }),
        [currentUser, stepKey]);

    // AI sidebar (only group 3)
    const [collapsed, setCollapsed] = useState(false);
    const { width, startResize } = useResizableWidth({
        initial: 28 * 16, min: MIN, max: MAX,
        onStart: (p) => logResize.onStart(p),
        onEnd: (p) => logResize.onEnd(p),
    });
    const aiEnabled = !!uid && ai === true;

    const handleFinalSubmit = async () => {
        if (!isLast || !allValid || submitting) return;
        if (!uid) {
            await logClientError({ error: "No UID at submit", source: "Training.finalSubmit", reason: "User not logged in at submit" });
            alert("Please log in before submitting.");
            return;
        }
        setSubmitting(true);
        try {
            let answerObj = {};
            for (const s of steps) {
                const draft = readDraft(uid, s.key) || {};
                answerObj[s.key] = draft.text
                await setDoc(
                    doc(db, "sessionInfo", uid, "responses", s.key),
                    { type: s.key, ...draft, submitted: true, draft: false, status: "final-submit", updatedAt: serverTimestamp() },
                    { merge: true }
                );
            }
            try {
                await sendAnswerStatement(currentUser, 'training', answerObj);
            } catch { }

            try {
                const raw = localStorage.getItem(CHAT_STORAGE_ID);
                if (raw) {
                    const convo = JSON.parse(raw);
                    const transcript = buildFullTranscript(convo);

                    await sendConversationTranscript(currentUser, {
                        stageId: 'training',
                        conversationId: 'trainingAiConversation',
                        transcript,
                    });
                }
            } catch (err) {
                await logClientError({
                    error: err,
                    source: "Training.finalSubmit",
                    reason: "Failed to build/send branched chat transcript",
                });
            }

            try { for (const s of steps) localStorage.removeItem(storageKey(uid, s.key)); } catch { }
            try { localStorage.removeItem(CHAT_STORAGE_ID); } catch { }
            try {
                for (const s of steps) regRemove(s.key);
            } catch { }

            await flushStageBundleToGlobalXapi({ user: currentUser, stageId: 'training' });
            onComplete?.();
        } catch (e) {
            await logClientError({ error: e, source: "Training.finalSubmit", reason: "Failed writing final training answers" });
        } finally {
            setSubmitting(false);
        }
    };

    if (!steps.length) return null;

    return (
        <div className="mx-auto w-full max-w-screen-2xl px-6 pt-6 pb-28" onScroll={logScrollTraining}>
            <div className="border rounded-xl overflow-hidden h-[85vh]">
                <div className="relative flex h-full min-h-0">
                    {/* LEFT */}
                    <div className="flex-1 min-w-0 flex flex-col min-h-0">
                        <div className="px-4 py-3 border-b bg-base-100 flex items-center justify-between">
                            <div className="text-sm opacity-70">Step {currentIdx + 1} / {steps.length}</div>
                            {aiEnabled && (
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => { baseLogger.logClick("btn-AiCoach", collapsed ? "ShowAIcoach" : "HideAIcoach"); setCollapsed(c => !c); }}
                                    title={collapsed ? "Show AI Coach" : "Hide AI Coach"}
                                >
                                    {collapsed ? "Show Coach" : "Hide Coach"}
                                </button>
                            )}
                        </div>

                        <div
                            className="p-6 flex-1 overflow-auto"
                            onScroll={logScrollStepBody}
                            data-stage={STAGE_ID}
                            data-step={stepKey}
                        >
                            <Comp
                                onValidChange={handleCurrentValidChange}
                                logClick={baseLogger.logClick}
                                logSystemGenerated={baseLogger.logSystemGenerated}
                                onKeyDown={baseLogger.onKeyDown}
                                currentUser={currentUser}
                            />
                        </div>

                        <div className="px-6 py-4 border-t flex items-center justify-between">
                            <div className="flex gap-2">
                                <button className="btn" onClick={() => { baseLogger.logClick("btn-previous", "Previous"); goPrev(); }} disabled={isFirst}>‹ Previous</button>
                                <button className="btn" onClick={() => { baseLogger.logClick("btn-next", "Next"); goNext(); }} disabled={isLast}>Next ›</button>
                            </div>
                            {isLast && (
                                <button className={`btn ${allValid ? "btn-primary" : "btn-disabled"}`} onClick={() => { baseLogger.logClick("btn-submit", "Submit"); handleFinalSubmit(); }} disabled={!allValid || submitting}>
                                    {submitting ? "Submitting…" : "Submit"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: AI Coach */}
                    {aiEnabled && (
                        <ResizableSidebar
                            width={width}
                            min={MIN}
                            max={MAX}
                            collapsed={collapsed}
                            onResizeStart={startResize}>
                            <div
                                className="h-full min-h-0"
                                data-stage={STAGE_ID}
                                data-step={`${stepKey}-AiChatBox`}
                            >
                                <ChatBoxAI
                                    title="AI Coach"
                                    storageKey={CHAT_STORAGE_ID}
                                    logClick={aiLogger.logClick}
                                    logSystemGenerated={aiLogger.logSystemGenerated}
                                    onKeyDown={aiLogger.onKeyDown}
                                    onScroll={logScrollAI}
                                />
                            </div>
                        </ResizableSidebar>
                    )}
                </div>
            </div>
        </div>
    );
}

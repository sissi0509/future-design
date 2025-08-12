// src/components/training/RevisionStep.jsx
import { useEffect, useMemo, useState } from "react";
import {
    collection,
    query,
    where,
    limit,
    getDocs,
    addDoc,
    updateDoc,
    setDoc,
    doc,
} from "firebase/firestore";
import { useAuth } from "../User/AuthSetUp";          // ⬅️ adjust if needed
import { db } from "../../config/Firebase";           // ⬅️ adjust if needed
import ChatBoxAI from "./ChatBoxAI";
import TextQuestion from "../questions/TextQuestion";

// Practice question sets (to locate the text question + constraints)
import stage1PracticeQuestions from "../../data/questions/training/stage1Practice";
// import stage2PracticeQuestions from "../../data/questions/training/stage2Practice";
// import stage3PracticeQuestions from "../../data/questions/training/stage3Practice";
// import stage4PracticeQuestions from "../../data/questions/training/stage4Practice";
// import stage5PracticeQuestions from "../../data/questions/training/stage5Practice";

const PRACTICE_BY_STAGE = {
    1: stage1PracticeQuestions,
    // 2: stage2PracticeQuestions,
    // 3: stage3PracticeQuestions,
    // 4: stage4PracticeQuestions,
    // 5: stage5PracticeQuestions,
};

export default function RevisionStep({ stage, onComplete }) {
    const { currentUser } = useAuth();

    // ---- Collapsible coach panel (persist to localStorage) ----
    const LS_KEY = "aiCoachCollapsed";
    const [collapsed, setCollapsed] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem(LS_KEY);
        if (saved != null) setCollapsed(saved === "1");
    }, []);
    useEffect(() => {
        localStorage.setItem(LS_KEY, collapsed ? "1" : "0");
    }, [collapsed]);

    // ---- Find the *text* question from this stage's practice set ----
    const textQuestion = useMemo(() => {
        const set = PRACTICE_BY_STAGE[stage] || [];
        return set.find((q) => q.type === "text") || null;
    }, [stage]);

    const minWords = textQuestion?.minWords ?? 0;
    const maxWords = textQuestion?.maxWords ?? Infinity;

    const [loading, setLoading] = useState(true);
    const [prevAnswer, setPrevAnswer] = useState("");
    const [editValue, setEditValue] = useState("");
    const [error, setError] = useState("");

    // ---- Load previous practice answer by querying responses where type == stage${stage}Practice ----
    useEffect(() => {
        if (!currentUser?.uid || !textQuestion?.key) {
            setLoading(false);
            return;
        }
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError("");
            try {
                const coll = collection(db, "sessionInfo", currentUser.uid, "responses");
                const q = query(coll, where("type", "==", `stage${stage}Practice`), limit(1));
                const qs = await getDocs(q);

                let ans = "";
                if (!qs.empty) {
                    const data = qs.docs[0].data() || {};
                    // Your responses store answers as top-level fields like "stage1q4"
                    if (data[textQuestion.key] != null) {
                        ans = String(data[textQuestion.key]);
                    } else if (data.answers && data.answers[textQuestion.key] != null) {
                        // Fallback if some docs used an "answers" map
                        ans = String(data.answers[textQuestion.key]);
                    }
                }

                if (!cancelled) {
                    setPrevAnswer(ans);
                    setEditValue(ans); // prefill editor with prior answer
                }
            } catch (e) {
                console.warn("Failed to load prior answer:", e);
                if (!cancelled) setError("Failed to load your previous answer.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [currentUser?.uid, stage, textQuestion?.key]);

    // ---- Validate word count (same logic as your TextQuestion) ----
    const wordCount = editValue.trim() ? editValue.trim().split(/\s+/).length : 0;
    const isValid = wordCount >= minWords && wordCount <= maxWords;

    // ---- Save revision + mark progress.revisionCompleted = true ----
    const handleSubmit = async () => {
        if (!currentUser?.uid) return;

        try {
            // Save a new revision response (random doc id)
            const coll = collection(db, "sessionInfo", currentUser.uid, "responses");
            await addDoc(coll, {
                type: `stage${stage}Revision`,
                originalKey: textQuestion?.key || "",
                original: prevAnswer || "",
                revised: editValue || "",
                updatedAt: Date.now(),
            });

            // Mark progress on the root sessionInfo/{uid} doc
            const userRef = doc(db, "sessionInfo", currentUser.uid);
            try {
                await updateDoc(userRef, {
                    [`progress.training.stage${stage}.revisionCompleted`]: true,
                });
            } catch {
                // If doc doesn't exist yet, create it with a merge
                const patch = { progress: { training: {} } };
                patch.progress.training[`stage${stage}`] = { revisionCompleted: true };
                await setDoc(userRef, patch, { merge: true });
            }

            // Notify parent (StepPage -> Training will navigate back)
            onComplete?.({ original: prevAnswer, revised: editValue });
        } catch (e) {
            console.warn("Failed to save revision:", e);
            setError("Failed to save. Please try again.");
        }
    };

    if (!currentUser?.uid) {
        return <div className="text-sm text-gray-600">Please sign in to view this page.</div>;
    }

    return (
        <div className="mx-auto w-full max-w-screen-2xl px-6 pt-6 pb-28">
            <div className="border rounded-xl overflow-hidden h-[85vh]">
                <div className="relative flex h-full">
                    {/* LEFT: TextQuestion editor (prefilled) */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="px-4 py-3 border-b bg-base-100 flex items-center justify-between">
                            <div className="font-medium">Revise your Practice Response</div>
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() => setCollapsed((c) => !c)}
                                title={collapsed ? "Show AI Coach" : "Hide AI Coach"}
                            >
                                {collapsed ? "Show Coach" : "Hide Coach"}
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-auto">
                            {loading ? (
                                <p>Loading…</p>
                            ) : (
                                <div className="space-y-5">
                                    {error && <div className="alert alert-warning">{error}</div>}

                                    {textQuestion ? (
                                        <TextQuestion
                                            label={textQuestion.label}
                                            value={editValue}
                                            onChange={setEditValue}
                                            placeholder={textQuestion.placeholder || "Revise your answer here…"}
                                            minWords={minWords}
                                            maxWords={maxWords}
                                        />
                                    ) : (
                                        <div className="rounded-xl border p-4">
                                            No text question found for this stage.
                                        </div>
                                    )}

                                    {prevAnswer && (
                                        <div className="rounded-xl border p-3 bg-base-200/50 text-sm text-gray-700">
                                            <div className="font-medium mb-1">Previously saved answer</div>
                                            <p className="whitespace-pre-wrap leading-6">{prevAnswer}</p>
                                        </div>
                                    )}

                                    <div className="mt-2 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={() => setEditValue(prevAnswer || "")}
                                        >
                                            Reset to previous
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={!editValue.trim() || !isValid}
                                            onClick={handleSubmit}
                                        >
                                            Save Revision
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Collapsible AI Coach */}
                    <div
                        className={[
                            "bg-base-200 transition-[width] duration-200 ease-in-out h-full relative",
                            collapsed ? "w-0" : "w-[28rem]",
                            collapsed ? "border-l-0" : "border-l",
                        ].join(" ")}
                        aria-hidden={collapsed}
                    >
                        <div
                            className={[
                                "absolute inset-0 flex flex-col transition-opacity duration-150",
                                collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
                            ].join(" ")}
                        >
                            <div className="flex-1 overflow-auto">
                                <ChatBoxAI title="AI Coach" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

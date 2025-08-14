// src/components/training/RevisionStep.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { doc, getDoc, updateDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { useAuth } from "../User/AuthSetUp";
import { db } from "../../config/Firebase";
import ChatBoxAI from "./ChatBoxAI";
import TextQuestion from "../questions/TextQuestion";

export default function RevisionStep({ onComplete }) {
    const { currentUser } = useAuth();

    const [collapsed, setCollapsed] = useState(false);
    useEffect(() => {
        const s = localStorage.getItem("aiCoachCollapsed");
        if (s != null) setCollapsed(s === "1");
    }, []);
    useEffect(() => {
        localStorage.setItem("aiCoachCollapsed", collapsed ? "1" : "0");
    }, [collapsed]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [prevQuestion, setPrevQuestion] = useState("");
    const [prevAnswer, setPrevAnswer] = useState("");
    const [editValue, setEditValue] = useState("");

    const [minWords, setMinWords] = useState(30);
    const [maxWords, setMaxWords] = useState(400);

    // Load preset “previous info” from sessionInfo/{uid}.progress.training.seed
    useEffect(() => {
        if (!currentUser?.uid) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError("");
            try {
                const ref = doc(db, "sessionInfo", currentUser.uid);
                const snap = await getDoc(ref);
                const data = snap.exists() ? snap.data() : {};
                const seed = data?.progress?.training?.seed || {};
                const q = String(seed.question || "");
                const a = String(seed.answer || "");
                if (!cancelled) {
                    setPrevQuestion(q);
                    setPrevAnswer(a);
                    setEditValue(a); // prefill with previous answer
                    if (Number.isFinite(seed.minWords)) setMinWords(seed.minWords);
                    if (Number.isFinite(seed.maxWords)) setMaxWords(seed.maxWords);
                }
            } catch (e) {
                console.warn("Failed to load training seed:", e);
                if (!cancelled) setError("Failed to load your preset answer.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [currentUser?.uid]);

    const wordCount = editValue.trim() ? editValue.trim().split(/\s+/).length : 0;
    const isValid = wordCount >= minWords && wordCount <= maxWords;

    const handleSubmit = useCallback(async () => {
        if (!currentUser?.uid) return;
        try {
            const userRef = doc(db, "sessionInfo", currentUser.uid);

            // Optional: keep a revision record in subcollection for audit/history
            try {
                const coll = collection(db, "sessionInfo", currentUser.uid, "responses");
                await addDoc(coll, {
                    type: "trainingRevision",
                    presetQuestion: prevQuestion,
                    original: prevAnswer,
                    revised: editValue,
                    updatedAt: Date.now(),
                });
            } catch { /* non-fatal */ }

            // Mark revision completed + store final revision on root doc
            try {
                await updateDoc(userRef, {
                    "progress.training.revisionCompleted": true,
                    "progress.training.revisionAnswer": editValue,
                });
            } catch {
                await setDoc(
                    userRef,
                    {
                        progress: {
                            training: {
                                revisionCompleted: true,
                                revisionAnswer: editValue,
                            },
                        },
                    },
                    { merge: true }
                );
            }

            onComplete?.({ presetQuestion: prevQuestion, original: prevAnswer, revised: editValue });
        } catch (e) {
            console.warn("Failed to save revision:", e);
            setError("Failed to save. Please try again.");
        }
    }, [currentUser?.uid, editValue, prevAnswer, prevQuestion, onComplete]);

    if (!currentUser?.uid) {
        return <div className="text-sm text-gray-600">Please sign in to view this page.</div>;
    }

    return (
        <div className="mx-auto w-full max-w-screen-2xl px-6 pt-6 pb-28">
            <div className="border rounded-xl overflow-hidden h-[85vh]">
                <div className="relative flex h-full">
                    {/* LEFT: editor */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="px-4 py-3 border-b bg-base-100 flex items-center justify-between">
                            <div className="font-medium">Revise your preset response</div>
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

                                    {prevQuestion && (
                                        <div className="rounded-xl border p-3 bg-base-200/50 text-sm text-gray-700">
                                            <div className="font-medium mb-1">Previous Question</div>
                                            <p className="whitespace-pre-wrap leading-6">{prevQuestion}</p>
                                        </div>
                                    )}

                                    <TextQuestion
                                        label="Your revised answer"
                                        value={editValue}
                                        onChange={setEditValue}
                                        placeholder="Improve your earlier answer. Be specific about what changed and why."
                                        minWords={minWords}
                                        maxWords={maxWords}
                                    />

                                    {prevAnswer && (
                                        <div className="rounded-xl border p-3 bg-base-200/50 text-sm text-gray-700">
                                            <div className="font-medium mb-1">Preset (original) answer</div>
                                            <p className="whitespace-pre-wrap leading-6">{prevAnswer}</p>
                                        </div>
                                    )}

                                    <div className="mt-2 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={() => setEditValue(prevAnswer || "")}
                                        >
                                            Reset to preset
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

                    {/* RIGHT: AI Coach */}
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

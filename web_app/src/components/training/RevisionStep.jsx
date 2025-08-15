// src/components/training/RevisionStep.jsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../User/AuthSetUp";
import { db } from "../../config/Firebase";
import ChatBoxAI from "./ChatBoxAI";
import TextQuestion from "../questions/TextQuestion";
import { useAnswersRegistry } from "../../context/AnswersRegistry";
import { getCoachPrompt } from "../../data/questions/training/aiCoachPrompts";

export default function RevisionStep({ onComplete }) {
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;
    const { set, remove } = useAnswersRegistry();

    const [collapsed, setCollapsed] = useState(false); // always start open
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [groupNumber, setGroupNumber] = useState(null)

    const [seed, setSeed] = useState({ question: "", answer: "", min: 30, max: 400 });
    const [value, setValue] = useState("");
    const [hydrated, setHydrated] = useState(false); // prevents “empty overwrite” on first render

    const lsKey = uid ? `training-rev-${uid}` : null;   // localStorage key
    const registryKey = "trainingRevision";              // AnswersRegistry key

    // Load once: seed + any prior draft (from responses doc), then prefer localStorage
    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!uid) { setLoading(false); return; }
            setLoading(true);
            setError("");

            try {
                const [rootSnap, respSnap] = await Promise.all([
                    getDoc(doc(db, "sessionInfo", uid)),
                    getDoc(doc(db, "sessionInfo", uid, "responses", "trainingRevision")),
                ]);

                const root = rootSnap.exists() ? rootSnap.data() : {};
                const s = root?.progress?.training?.seed || {};
                const resp = respSnap.exists() ? respSnap.data() : null;

                const nextSeed = {
                    question: String(s.question || ""),
                    answer: String(s.answer || ""),
                    min: Number.isFinite(s.minWords) ? s.minWords : 30,
                    max: Number.isFinite(s.maxWords) ? s.maxWords : 400,
                };

                const respDraft = typeof resp?.revised === "string" ? resp.revised : null;

                // priority: localStorage -> Firestore draft -> seed answer
                const localStr = lsKey ? localStorage.getItem(lsKey) : null;
                const initial = localStr !== null ? localStr : (respDraft ?? String(s.answer || ""));

                if (cancelled) return;
                const gn = Number(root?.groupNumber);
                setGroupNumber(Number.isFinite(gn) ? gn : null);

                setSeed(nextSeed);
                setValue(initial);
                setHydrated(true);
            } catch (e) {
                console.warn("Failed to load revision context:", e);
                if (!cancelled) setError("Failed to load your previous revision.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [uid, lsKey]);

    // Save draft to localStorage AFTER hydration
    useEffect(() => {
        if (!lsKey || !hydrated) return;
        localStorage.setItem(lsKey, value ?? "");
    }, [lsKey, value, hydrated]);

    // Register draft for logout flush AFTER hydration
    useEffect(() => {
        if (!uid || !hydrated) return;
        const trimmed = (value || "").trim();
        if (!trimmed) {
            remove(registryKey);
            return;
        }
        set(registryKey, {
            type: "trainingRevision",
            answers: {
                presetQuestion: seed.question,
                original: seed.answer,
                revised: value,
            },
        });
    }, [uid, hydrated, seed.question, seed.answer, value, set, remove]);

    // Validation
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const isValid = wordCount >= seed.min && wordCount <= seed.max;

    // Final submit: parent (StepPage) will write to Firestore + advance flow
    const handleSubmit = async () => {
        if (!uid || !isValid) return;
        try {
            await onComplete?.({
                presetQuestion: seed.question,
                original: seed.answer,
                revised: value,
            });
            // clean up local & registry so logout won’t flush again
            if (lsKey) localStorage.removeItem(lsKey);
            remove(registryKey);
        } catch (e) {
            console.warn("Failed to save revision (parent):", e);
            setError("Failed to save. Please try again.");
        }
    };

    if (!uid) return <div className="text-sm text-gray-600">Please sign in to view this page.</div>;

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

                                    {seed.question && (
                                        <div className="rounded-xl border p-3 bg-base-200/50 text-sm text-gray-700">
                                            <div className="font-medium mb-1">Previous Question</div>
                                            <p className="whitespace-pre-wrap leading-6">{seed.question}</p>
                                        </div>
                                    )}

                                    <TextQuestion
                                        label="Your revised answer"
                                        value={value}
                                        onChange={setValue}
                                        placeholder="Improve your earlier answer. Be specific about what changed and why."
                                        minWords={seed.min}
                                        maxWords={seed.max}
                                    />

                                    {seed.answer && (
                                        <div className="rounded-xl border p-3 bg-base-200/50 text-sm text-gray-700">
                                            <div className="font-medium mb-1">Preset (original) answer</div>
                                            <p className="whitespace-pre-wrap leading-6">{seed.answer}</p>
                                        </div>
                                    )}

                                    <div className="mt-2 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={() => setValue(seed.answer || "")}
                                        >
                                            Reset to preset
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={!value.trim() || !isValid}
                                            onClick={handleSubmit}
                                        >
                                            Submit
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
                                <ChatBoxAI
                                    title="AI Coach"
                                    chatKey="trainingRevision"
                                    uid={currentUser?.uid}
                                    group={groupNumber}
                                    firstMessage={getCoachPrompt(groupNumber)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

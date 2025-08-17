import { useState } from "react";
import { useAuth } from "../User/AuthSetUp";
import { db } from "../../config/Firebase";
import ChatBoxAI from "./ChatBoxAI";
import TextQuestion from "../questions/TextQuestion";
import { useAnswersRegistry } from "../../context/AnswersRegistry";


import { useResizableWidth } from "../../hooks/useResizableWidth";
import { useRevisionData } from "../../hooks/useRevisionData";
import ResizableSidebar from "../ResizableSidebar";

const MIN = 18 * 16;
const MAX = 64 * 16;

export default function RevisionStep({ onComplete }) {
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;
    const registry = useAnswersRegistry();

    // data hook
    const { loading, error, groupNumber, seed, value, setValue } = useRevisionData({
        uid,
        db,
        lsKey: uid ? `training-rev-${uid}` : null,
        registry,
        registryKey: "trainingRevision",
    });

    // sidebar size
    const min = MIN;
    const max = MAX;
    const { width, startResize } = useResizableWidth({
        initial: 28 * 16,
        min,
        max,
    });

    const [collapsed, setCollapsed] = useState(false);

    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const isValid = wordCount >= seed.min && wordCount <= seed.max;

    const handleSubmit = async () => {
        if (!uid || !isValid) return;
        try {
            await onComplete?.({
                presetQuestion: seed.question,
                original: seed.answer,
                revised: value,
            });
            if (uid) localStorage.removeItem(`training-rev-${uid}`);
            registry.remove("trainingRevision");
        } catch {

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

                    {/* RIGHT: AI Coach (presentational sidebar) */}
                    <ResizableSidebar
                        width={width}
                        min={min}
                        max={max}
                        collapsed={collapsed}
                        onResizeStart={startResize}
                    >
                        {groupNumber !== null && (
                            <ChatBoxAI
                                title="AI Coach"
                                registryKey="trainingAiConversation"
                                uid={uid}
                                group={groupNumber}
                            />
                        )}
                    </ResizableSidebar>
                </div>
            </div>
        </div>
    );
}

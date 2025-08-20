import { use, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/Firebase";
import { logClientError } from "../../services/errorHandle/logClientError";

import goalQuestions from "../../data/questions/training/goal";
import BasicQuestion from './BasicQuestion'


export default function GoalPage({ onValidChange, uid }) {
    const [seed, setSeed] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) {
            setSeed(goalQuestions);
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const ref = doc(db, "sessionInfo", uid);
                const snap = await getDoc(ref);
                const data = snap.exists() ? snap.data() : null;
                const s = data?.progress?.training?.seed || null;
                if (!cancelled) setSeed(s);
            } catch (err) {
                await logClientError({
                    error: err,
                    source: "GoalPage.loadSeed",
                    reason: "Failed to load training seed",
                });
                if (!cancelled) setSeed(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [uid]);


    return (
        <div>
            <BasicQuestion
                onValidChange={onValidChange}
                registryKey="training-goal"
                uid={uid}
                question={goalQuestions}
            />
            <div className="rounded-lg border bg-base-100 p-4 mt-8">
                <h3 className="font-semibold mb-2">Your previous responses:</h3>

                {loading ? (
                    <div className="opacity-70 text-sm">Loading…</div>
                ) : seed ? (
                    <div className="space-y-4 text-sm leading-relaxed">
                        <section>
                            <div className="font-medium">
                                {seed?.expect?.prompt ?? "What you expect in 5 years"}
                            </div>
                            <ul className="list-disc ml-5 mt-1 space-y-1">
                                {(seed?.expect?.answers ?? []).map((a, i) => (
                                    <li key={i}>{a}</li>
                                ))}
                            </ul>
                        </section>

                        {/* Avoid */}
                        <section>
                            <div className="font-medium">
                                {seed?.avoid?.prompt ?? "What you want to avoid in 5 years"}
                            </div>
                            <ul className="list-disc ml-5 mt-1 space-y-1">
                                {(seed?.avoid?.answers ?? []).map((a, i) => (
                                    <li key={i}>{a}</li>
                                ))}
                            </ul>
                        </section>

                        {/* Advice */}
                        <section>
                            <div className="font-medium">
                                {seed?.advice?.prompt ?? "Most influential advice"}
                            </div>
                            <p className="mt-1">{seed?.advice?.answer ?? ""}</p>
                        </section>
                    </div>
                ) : (
                    <div className="opacity-70 text-sm">No previous answers found.</div>
                )}
            </div>
        </div>
    );

}

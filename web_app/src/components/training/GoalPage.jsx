import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/Firebase";
import { logClientError } from "../../services/errorHandle/logClientError";

import goalQuestions from "../../data/questions/training/goal";
import BasicQuestion from './BasicQuestion'


export default function GoalPage({ onValidChange, currentUser, onKeyDown, logClick, logSystemGenerated }) {
    const [previousResponses, setPreviousResponses] = useState(null);
    const [loading, setLoading] = useState(true);

    const uid = currentUser?.uid;
    useEffect(() => {
        if (!uid) {
            setPreviousResponses(goalQuestions);
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
                const s = data?.progress?.training?.previousResponses || null;
                if (!cancelled) setPreviousResponses(s);
            } catch (err) {
                await logClientError({
                    error: err,
                    source: "GoalPage.loadpreviousResponses",
                    reason: "Failed to load previous responses ",
                });
                if (!cancelled) setPreviousResponses(null);
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
                stage='training'
                step='goal'
                currentUser={currentUser}
                question={goalQuestions}
                logClick={logClick}
                logSystemGenerated={logSystemGenerated}
                onKeyDown={onKeyDown}
            />
            <div className="rounded-lg border bg-base-100 p-4 mt-8">
                <h3 className="font-semibold mb-2">Your previous responses:</h3>

                {loading ? (
                    <div className="opacity-70 text-sm">Loading…</div>
                ) : previousResponses ? (
                    <div className="space-y-4 text-sm leading-relaxed">
                        <section>
                            <div className="font-medium">
                                {previousResponses?.expect?.prompt ?? "What you expect in 5 years"}
                            </div>
                            <ul className="list-disc ml-5 mt-1 space-y-1">
                                {(previousResponses?.expect?.answers ?? []).map((a, i) => (
                                    <li key={i}>{a}</li>
                                ))}
                            </ul>
                        </section>

                        {/* Avoid */}
                        <section>
                            <div className="font-medium">
                                {previousResponses?.avoid?.prompt ?? "What you want to avoid in 5 years"}
                            </div>
                            <ul className="list-disc ml-5 mt-1 space-y-1">
                                {(previousResponses?.avoid?.answers ?? []).map((a, i) => (
                                    <li key={i}>{a}</li>
                                ))}
                            </ul>
                        </section>

                        {/* Advice */}
                        <section>
                            <div className="font-medium">
                                {previousResponses?.advice?.prompt ?? "Most influential advice"}
                            </div>
                            <p className="mt-1">{previousResponses?.advice?.answer ?? ""}</p>
                        </section>
                    </div>
                ) : (
                    <div className="opacity-70 text-sm">No previous answers found.</div>
                )}
            </div>
        </div>
    );

}

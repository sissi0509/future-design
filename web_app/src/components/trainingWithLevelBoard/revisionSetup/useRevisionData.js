import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

/**
 * Loads training revision seed + draft.
 * Manages localStorage draft and AnswersRegistry sync.
 *
 * @param {object} params
 * @param {string} params.uid
 * @param {any} params.db - Firestore instance
 * @param {string|null} params.lsKey - localStorage key for draft (or null)
 * @param {{ set: Function, remove: Function }} params.registry
 * @param {string} [params.registryKey="trainingRevision"]
 */
export function useRevisionData({
    uid,
    db,
    lsKey,
    registry,
    registryKey = "trainingRevision",
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [groupNumber, setGroupNumber] = useState(null);
    const [seed, setSeed] = useState({ question: "", answer: "", min: 30, max: 400 });
    const [value, setValue] = useState("");
    const [hydrated, setHydrated] = useState(false);

    // Load seed + prior draft
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!uid) { setLoading(false); return; }
            setLoading(true); setError("");

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

                const localStr = lsKey ? localStorage.getItem(lsKey) : null;
                const initial = localStr !== null ? localStr : (respDraft ?? String(s.answer || ""));

                if (cancelled) return;

                const gn = Number(root?.groupNumber);
                setGroupNumber(Number.isFinite(gn) ? gn : null);
                setSeed(nextSeed);
                setValue(initial);
                setHydrated(true);
            } catch (e) {
                if (!cancelled) setError("Failed to load your previous revision.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [uid, lsKey, db]);

    // Save draft to localStorage AFTER hydration
    useEffect(() => {
        if (!lsKey || !hydrated) return;
        try { localStorage.setItem(lsKey, value ?? ""); } catch { }
    }, [lsKey, value, hydrated]);

    // Register draft to AnswersRegistry AFTER hydration
    useEffect(() => {
        if (!uid || !hydrated) return;
        const trimmed = (value || "").trim();
        if (!trimmed) {
            registry.remove(registryKey);
            return;
        }
        registry.set(registryKey, {
            type: registryKey,
            answers: {
                presetQuestion: seed.question,
                original: seed.answer,
                revised: value,
            },
        });
    }, [uid, hydrated, seed.question, seed.answer, value, registry, registryKey]);

    return { loading, error, groupNumber, seed, value, setValue, hydrated };
}

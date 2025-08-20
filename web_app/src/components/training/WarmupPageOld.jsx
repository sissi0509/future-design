import { useEffect, useMemo, useState } from "react";
import TextQuestion from "../questions/TextQuestion";
import warmupQuestions from "../../data/questions/training/warmup";
import { useAnswersRegistry } from "../../context/AnswersRegistry";
import { useAuth } from "../User/AuthSetUp";
import warmupQuestions from "../../data/questions/training/warmup";

export default function WarmupPage({ onValidChange, uid }) {
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    const registryKey = "training-warmup";
    const storageKey = useMemo(
        () => (uid ? `train-${uid}-warmup-draft` : "train-anon-warmup-draft"),
        [uid]
    );

    const { set: regSet } = useAnswersRegistry();

    const [value, setValue] = useState(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            const parsed = raw ? JSON.parse(raw) : null;
            return typeof parsed?.warmupText === "string" ? parsed.warmupText : "";
        } catch {
            return "";
        }
    });

    // compute validity
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const isValid =
        wordCount >= warmupQuestions.minWords && wordCount <= warmupQuestions.maxWords;

    // persist draft + validity (refresh-proof)
    useEffect(() => {
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    warmupText: value,
                    isValid,
                    updatedAtMs: Date.now(),
                })
            );
        } catch { }
    }, [storageKey, value, isValid]);

    // mirror to AnswersRegistry for logout flush (debounced)
    useEffect(() => {
        if (!uid) return;
        const t = setTimeout(() => {
            regSet(registryKey, {
                type: registryKey,
                answers: {
                    warmupText: value ?? "",
                    isValid,
                    draft: true,
                    updatedAtMs: Date.now(),
                },
            });
        }, 250);
        return () => clearTimeout(t);
    }, [uid, value, isValid, regSet]);

    // tell Training whenever validity changes
    useEffect(() => {
        onValidChange?.(isValid);
    }, [isValid, onValidChange]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Warmup</h2>
            <TextQuestion
                label={warmupQuestions.label}
                value={value}
                onChange={setValue}
                placeholder="Write your response here..."
                minWords={warmupQuestions.minWords}
                maxWords={warmupQuestions.maxWords}
            />
        </div>
    );
}

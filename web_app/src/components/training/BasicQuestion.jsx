import { useEffect, useMemo, useState } from "react";
import TextQuestion from "../questions/TextQuestion";
import { useAnswersRegistry } from "../../context/AnswersRegistry";

import { makeKeydownLogger, makeClickLogger, makeSystemGeneratedLogger } from "../../services/xapi/eventStatements";

export default function BasicQuestion({ onValidChange, stage, step, currentUser, question }) {

    const registryKey = `${stage}-${step}`;
    const uid = currentUser?.uid;

    const storageKey = useMemo(
        () => (uid ? `train-${uid}-${registryKey}-draft` : `train-anon-${registryKey}-draft`),
        [uid, registryKey]
    );

    const { set: regSet } = useAnswersRegistry();

    const [value, setValue] = useState(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            const parsed = raw ? JSON.parse(raw) : null;
            return typeof parsed?.text === "string" ? parsed.text : "";
        } catch {
            return "";
        }
    });

    // compute validity
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const isValid =
        wordCount >= question.minWords && wordCount <= question.maxWords;

    // persist draft + validity (refresh-proof)
    useEffect(() => {
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    text: value,
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
                type: { registryKey },
                answers: {
                    text: value ?? "",
                    isValid,
                    draft: true,
                    updatedAtMs: Date.now(),
                },
            });
        }, 400);
        return () => clearTimeout(t);
    }, [uid, value, isValid, regSet]);

    // tell Training whenever validity changes
    useEffect(() => {
        onValidChange?.(isValid);
    }, [isValid, onValidChange]);

    const onKeyDown = useMemo(() => {
        return makeKeydownLogger({
            user: currentUser,
            stageId: stage,
            stepKey: step,
        });
    }, [currentUser, stage, step]);



    const logClick = useMemo(() => {
        return makeClickLogger({ user: currentUser, stageId: stage, stepKey: step });
    }, [currentUser, stage, step]);

    const logSystemGenerated = useMemo(
        () => makeSystemGeneratedLogger({ user: currentUser, stageId: stage, stepKey: step }),
        [currentUser, stage, step]
    );

    return (
        <div className="space-y-4">
            {/* <h2 className="text-xl font-semibold">{question.title}</h2> */}
            <TextQuestion
                label={question.label}
                value={value}
                onChange={setValue}
                placeholder="Write your response here..."
                minWords={question.minWords}
                maxWords={question.maxWords}
                onKeyDown={onKeyDown}
                onClick={logClick}
                logSystemGenerated={logSystemGenerated}
            />
        </div>
    );
}

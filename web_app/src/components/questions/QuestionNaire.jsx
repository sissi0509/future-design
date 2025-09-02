import { useEffect, useState, useMemo } from "react";
import TextQuestion from "./TextQuestion";
import MultipleChoice from "./MultipleChoice";
import LikertMatrix from "./LikertMatrix";
import RangeQuestion from './RangeQuestion'
import { makeKeydownLogger, makeSelectLogger, makeToggleLogger, makeClickLogger, makeSystemGeneratedLogger } from '../../services/xapi/eventStatements'

export default function Questionnaire({
    questions = [],
    onSubmit,
    title = "Questions",
    autosaveKey,
    submitting = false,
    onChangeAnswers,
    stageId,
    currentUser
}) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [initialized, setInitialized] = useState(false); // gate saving after restore
    const [submitVisible, setSubmitVisible] = useState(false); // 🔒 anti-ghost-click

    const total = questions.length;
    const isLast = step === total - 1;
    const current = questions[step];

    useEffect(() => {
        onChangeAnswers?.(answers);
    }, [answers, onChangeAnswers]);

    // ---- restore draft FIRST ----
    useEffect(() => {
        if (!autosaveKey) {
            setInitialized(true);
            return;
        }
        try {
            const raw = localStorage.getItem(autosaveKey);
            if (raw) {
                const { step: s, answers: a } = JSON.parse(raw);
                if (Number.isInteger(s)) setStep(s);
                if (a && typeof a === "object") setAnswers(a);
            }
        } catch { }
        setInitialized(true);
    }, [autosaveKey]);

    // clamp step after we know total
    useEffect(() => {
        if (!initialized) return;
        if (total === 0) return;
        if (step < 0) setStep(0);
        if (step > total - 1) setStep(total - 1);
    }, [initialized, total, step]);

    // Delay showing the submit button after landing on last step
    useEffect(() => {
        if (!initialized) return;
        if (isLast) {
            setSubmitVisible(false);
            const t = setTimeout(() => setSubmitVisible(true), 400); // 300–500ms is fine
            return () => clearTimeout(t);
        } else {
            setSubmitVisible(false);
        }
    }, [initialized, isLast, step]);

    // ---- save draft ONLY after initialized ----
    useEffect(() => {
        if (!autosaveKey || !initialized) return;
        localStorage.setItem(autosaveKey, JSON.stringify({ step, answers }));
    }, [autosaveKey, initialized, step, answers]);

    // ---- validation ----
    const wordCount = (t) =>
        typeof t === "string" ? t.trim().split(/\s+/).filter(Boolean).length : 0;

    const isValid = (q, v) => {
        if (!q) return false;
        if (q.type === "text") {
            const min = q.minWords ?? 0,
                max = q.maxWords ?? Infinity;
            const c = wordCount(v);
            return c >= min && c <= max;
        }
        if (q.type === "range") {
            if (v == null || !Number.isFinite(Number(v))) return false;
            const num = Number(v);
            return num >= q.rangeMin && num <= q.rangeMax;
        }
        if (q.type === "multiple") {
            const kind = q.kind || "single";
            if (kind === "multi") {
                const arr = Array.isArray(v) ? v : [];
                return arr.length >= 1;
            }

            if (kind === "likert-matrix") {
                const rows = q.rows || [];
                return rows.every(r => {
                    const rowKey = `${q.key}-${(r.key ?? r.label)}`;
                    return !!answers[rowKey];
                });
            }

            return !!v;
        }
        return false;
    };

    const currentVal = current ? answers[current?.key] : undefined;
    const currentValid = isValid(current, currentVal);

    // ---- handlers ----
    const setValue = (key, value) =>
        setAnswers((prev) => ({ ...prev, [key]: value }));

    const next = (e) => {
        // extra safety: blur to avoid “press & hold” repeating
        e?.currentTarget?.blur?.();
        if (currentValid) setStep((s) => Math.min(s + 1, total - 1));
    };

    const back = () => setStep((s) => Math.max(s - 1, 0));

    const submit = (e) => {
        e.preventDefault();
        if (!currentValid) return;
        if (autosaveKey) localStorage.removeItem(autosaveKey);
        onSubmit?.(answers);
    };

    const onKeyDown = makeKeydownLogger({
        user: currentUser,
        stageId: stageId,
        stepKey: current.key,
    });

    const onSelect = makeSelectLogger({
        user: currentUser,
        stageId: stageId,
        stepKey: current.key,

    })

    const onToggle = makeToggleLogger({
        user: currentUser,
        stageId: stageId,
        stepKey: current.key,

    })

    const logClick = useMemo(() => {
        return makeClickLogger({ user: currentUser, stageId, stepKey: current?.key });
    }, [currentUser, stageId, current?.key]);

    const logSystemGenerated = useMemo(
        () => makeSystemGeneratedLogger({ user: currentUser, stageId, stepKey: current?.key }),
        [currentUser, stageId, current?.key]
    );

    // Avoid flashing the first question before restore
    if (!initialized) {
        return <div className="max-w-xl mx-auto p-6 text-gray-500">Loading…</div>;
    }

    if (!total) {
        return (
            <div className="max-w-xl mx-auto p-6">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-gray-600 mt-2">No questions.</p>
            </div>
        );
    }

    return (
        <div
            data-stage={stageId}
            data-step={current?.key || "questionnaire"}
        >
            <form onSubmit={submit} className=" w-full max-w-3xl mx-auto p-6 space-y-6">
                <div className="flex items-start justify-between">
                    <h1 className="text-2xl font-bold">
                        {title}
                    </h1>
                    <span className="text-sm text-gray-500">
                        Step {Math.min(step + 1, total)} / {total}
                    </span>
                </div>
                <div class="mb-10">
                    {/* Render current question */}
                    {current?.type === "text" && (

                        <TextQuestion
                            label={current.label}
                            value={answers[current.key] ?? ""}
                            onChange={(val) => setValue(current.key, val)}
                            minWords={current.minWords}
                            maxWords={current.maxWords}
                            onKeyDown={onKeyDown}
                            onClick={logClick}
                            logSystemGenerated={logSystemGenerated}
                        />
                    )}

                    {current?.type === "range" && (
                        <RangeQuestion
                            label={current.label}
                            rangeMin={current.rangeMin}
                            rangeMax={current.rangeMax}
                            rangeStep={current.rangeStep}
                            startLabel={current.startLabel}
                            endLabel={current.endLabel}
                            value={Number.isFinite(answers[current.key]) ? answers[current.key] : current.rangeMin}
                            onClick={logClick}
                            onChange={(val) => {
                                setValue(current.key, val);
                                onSelect?.(`range:${current.key}`, String(val));
                            }}
                        />
                    )

                    }

                    {current?.type === "multiple" && (
                        current.kind === 'likert-matrix' ? (
                            <LikertMatrix
                                baseKey={current.key}               // "s2"
                                label={current.label}
                                rows={current.rows}                 // emotions
                                columns={current.columns}           // frequencies
                                answers={answers}
                                onChangeRow={(rowKey, colVal) => setValue(`${current.key}-${rowKey}`, colVal)}
                                onSelect={onSelect}
                                onClick={logClick}
                            />
                        ) : (
                            <MultipleChoice
                                label={current.label}
                                options={current.options}
                                value={
                                    current.kind === 'multi'
                                        ? (Array.isArray(answers[current.key]) ? answers[current.key] : [])
                                        : (answers[current.key] ?? '')
                                }
                                onChange={(val) => setValue(current.key, val)}
                                kind={current.kind || 'single'}
                                qkey={current.key}
                                onSelect={onSelect}
                                onToggle={onToggle}
                            />
                        )
                    )
                    }
                </div>

                {/* Nav */}
                <div className="flex justify-between gap-4">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            logClick("btn-next", "Next");
                            back();
                        }}
                        disabled={step === 0}

                    >
                        Back
                    </button>

                    {!isLast ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={(e) => {
                                logClick("btn-next", "Next");
                                next(e);
                            }}
                            disabled={!currentValid}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="btn btn-success"
                            onClick={() => {
                                logClick("btn-submit", "Submit");

                            }}
                            // don’t allow submit until last question is valid *and* the delay has passed
                            disabled={!currentValid || submitting || !submitVisible}
                        >
                            {submitting ? "Submitting…" : "Submit"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

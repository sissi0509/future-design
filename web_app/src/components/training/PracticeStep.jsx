import { useState, useMemo } from "react";
import TextQuestion from "../questions/TextQuestion";
import MultipleChoice from "../questions/MultipleChoice";
import Questionnaire from '../questions/QuestionNaire'; // Import for types, if needed

export default function PracticeStep({ onBack, onComplete }) {
    const [textAns, setTextAns] = useState("");
    const [mcq, setMcq] = useState("");

    const wordCount = useMemo(
        () => (textAns.trim() ? textAns.trim().split(/\s+/).length : 0),
        [textAns]
    );
    const valid = wordCount >= 20 && !!mcq;

    const submit = (e) => {
        e.preventDefault();
        if (!valid) return;
        // TODO: save to Firestore
        onComplete?.({ textAns, mcq });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <button className="btn btn-ghost" onClick={onBack}>← Back</button>
                <h2 className="text-xl font-bold">Practice</h2>
                <div />
            </div>

            <form onSubmit={submit} className="space-y-6">
                <TextQuestion
                    label="Summarize the textbook excerpt’s key idea."
                    value={textAns}
                    onChange={setTextAns}
                    minWords={20}
                    maxWords={Infinity}
                    placeholder="Write at least 20 words…"
                />

                <MultipleChoice
                    prompt="Which statement matches the concept best?"
                    options={["A", "B", "C", "D"]}
                    value={mcq}
                    onChange={setMcq}
                />

                <div className="flex justify-end gap-2">
                    <button type="button" className="btn" onClick={onBack}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={!valid}>
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}

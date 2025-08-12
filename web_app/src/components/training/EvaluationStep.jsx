import Questionnaire from '../questions/QuestionNaire';

// bring both reading + questions from one file
import stage1 from '../../data/questions/training/stage1Evaluation';

const EVALUATION_BY_STAGE = {
    1: stage1, // { reading, questions }
    // 2: stage2, 3: stage3, ... add later using same pattern
};

export default function EvaluationStep({ stage, onComplete }) {
    const mod = EVALUATION_BY_STAGE[stage] || {};
    const { reading, questions } = mod;

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)]">
            {/* Left: Reading */}
            <article className="rounded-xl border p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
                {reading ? (
                    <>
                        <h3 className="text-lg font-semibold mb-2">{reading.heading}</h3>
                        {reading.sections?.map((sec, i) => (
                            <section key={i} className="mt-4">
                                {sec.title && <h4 className="font-medium mb-1">{sec.title}</h4>}
                                {sec.body && <p className="text-gray-700 leading-6 whitespace-pre-line">{sec.body}</p>}
                                {sec.bullets && (
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        {sec.bullets.map((b, j) => <li key={j}>{b}</li>)}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </>
                ) : (
                    <p className="text-gray-600">Reading content coming soon…</p>
                )}
            </article>

            {/* Right: Questionnaire (sticky on large screens) */}
            <div className="rounded-xl border p-4 lg:p-6 lg:sticky lg:top-4 self-start">
                {questions ? (
                    <Questionnaire
                        questions={questions}
                        label={`Stage${stage}-Evaluation`}
                        collectionType={`stage${stage}Evaluation`}
                        userField={`progress.training.stage${stage}.evaluationCompleted`}
                        onComplete={onComplete}
                    />
                ) : (
                    <p className="text-gray-600">Questions coming soon…</p>
                )}
            </div>
        </div>
    );
}

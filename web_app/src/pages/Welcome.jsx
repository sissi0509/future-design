import { useState } from "react";
import { logClientError } from "../services/errorHandle/logClientError";
import { appendXapiToStage, flushStageBundleToGlobalXapi } from "../services/xapi/xapiBundles";
import { makeFunctionalClickStatement } from "../services/xapi/eventStatements";

export default function Welcome({ currentUser, onComplete }) {
    const [submitting, setSubmitting] = useState(false);

    const handleStart = async () => {

        setSubmitting(true);
        const user = currentUser;
        const stageId = "welcome";
        const stepKey = "intro";
        const controlId = "btn-get-started";

        try {
            // 1) Build & buffer the statement locally
            const statement = makeFunctionalClickStatement({
                user,
                stageId,
                stepKey,
                controlId,
                label: "Get Started",
            });
            appendXapiToStage(user, stageId, statement);
            await flushStageBundleToGlobalXapi({ user, stageId });
        } catch (err) {
            await logClientError({
                error: err,
                source: "Welcome.handleStart",
                reason: `Failed to append/flush xAPI for stageId=${stageId}`,
            });
        } finally {
            setSubmitting(false);
            onComplete?.();
        }
    };

    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
            <p className="text-lg mb-6">
                Thanks for joining our study. Please read the following information carefully before proceeding.
                ...
            </p>
            <button
                className="btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                onClick={handleStart}
                disabled={submitting}
            >
                {submitting ? "Starting..." : "Get Started"}
            </button>
        </div>
    );
}

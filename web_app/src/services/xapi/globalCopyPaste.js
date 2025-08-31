import { makeCopyPasteStatement } from "./eventStatements";
import { appendXapiToStage } from "./xapiBundles";
import { logClientError } from "../errorHandle/logClientError";


function findContext(el) {
    if (!el || el === document) return null;
    const node = el.closest?.("[data-stage][data-step]");
    if (!node) return null;
    return {
        stageId: node.getAttribute("data-stage"),
        stepKey: node.getAttribute("data-step"),
        targetId: el.id || null
    };
}

function getSelectedText() {
    const sel = window.getSelection && window.getSelection();
    const selected = sel && sel.toString();
    if (selected) return selected;

    const el = document.activeElement;
    if (el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT")) {
        const { selectionStart, selectionEnd, value } = el;
        if (typeof selectionStart === "number" && typeof selectionEnd === "number" && value != null) {
            return value.slice(selectionStart, selectionEnd);
        }
    }

    return "";
}

export function attachGlobalCopyPaste({
    user,
    defaultStageId = "app",
    defaultStepKey = "global",
}) {
    async function handle(action, e) {
        try {
            const ctx = findContext(e.target) || {
                stageId: defaultStageId,
                stepKey: defaultStepKey,
                targetId: (e.target && e.target.id) || null
            };

            let text = "";
            if (action === "copied") {
                text = getSelectedText();
            } else if (action === "pasted") {
                const cd = e.clipboardData;
                text = cd?.getData("text/plain") || cd?.getData("text") || "";
            }

            const stmt = makeCopyPasteStatement({
                user,
                stageId: ctx.stageId,
                stepKey: ctx.stepKey,
                action,
                text
            });

            appendXapiToStage(user, ctx.stageId, stmt);
        } catch (err) {
            await logClientError({
                error: err,
                source: "attachGlobalCopyPaste",
                reason: `action=${action}`
            });
        }
    }

    const onCopy = (e) => handle("copied", e);
    const onPaste = (e) => handle("pasted", e);

    document.addEventListener("copy", onCopy, true);
    document.addEventListener("paste", onPaste, true);

    return () => {
        document.removeEventListener("copy", onCopy, true);
        document.removeEventListener("paste", onPaste, true);
    };
}

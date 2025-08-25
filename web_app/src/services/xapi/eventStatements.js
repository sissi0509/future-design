import { buildActor } from './common/buildActor';
import { appendXapiToStage } from './xapiBundles';
import { logClientError } from '../errorHandle/logClientError';

// ---------- Pure statement builders ----------

export function makeKeystrokeStatement(user, stageId, stepKey, key, meta = {}) {
    const objectId = `urn:future-design:ui:stage/${stageId}/step/${stepKey}`;
    return {
        actor: buildActor(user),
        verb: { id: 'http://adlnet.gov/expapi/verbs/interacted', display: { 'en-US': 'interacted' } },
        object: {
            id: objectId,
            objectType: 'Activity',
            definition: {
                name: { 'en-US': 'Open-ended response field' },
                description: { 'en-US': 'A long-form text input.' },
                type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
                interactionType: 'long-fill-in',
            },
        },
        result: {
            extensions: {
                'https://futuredesign.app/xapi/ext/key': key,
                'https://futuredesign.app/xapi/ext/cursorStart': meta.cursorStart ?? null,
                'https://futuredesign.app/xapi/ext/cursorEnd': meta.cursorEnd ?? null,
            },
        },
        timestamp: new Date().toISOString(),
    };
}

export function makeFunctionalClickStatement({ user, stageId, stepKey, controlId, label }) {
    const objectId = `urn:future-design:ui:stage/${stageId}/step/${stepKey}/control/${controlId}`;
    return {
        actor: buildActor(user),
        timestamp: new Date().toISOString(),
        verb: { id: "http://adlnet.gov/expapi/verbs/interacted", display: { "en-US": "interacted" } },
        object: {
            id: objectId,
            objectType: "Activity",
            definition: {
                name: { "en-US": label || "UI control" },
                description: { "en-US": "Functional control" },
                type: "http://adlnet.gov/expapi/activities/media",
            },
        },
    };
}

export function makeOptionToggleStatement({ user, stageId, stepKey, choiceLabel, selected }) {
    const objectId = `urn:future-design:item:stage/${stageId}/step/${stepKey}/choice/${encodeURIComponent(choiceLabel)}`;
    const verb = selected
        ? { id: "http://adlnet.gov/expapi/verbs/selected", display: { "en-US": "selected" } }
        : { id: "https://futuredesign.app/xapi/verbs/deselected", display: { "en-US": "deselected" } };

    return {
        actor: buildActor(user),
        timestamp: new Date().toISOString(),
        verb,
        object: {
            id: objectId,
            objectType: "Activity",
            definition: {
                name: { "en-US": choiceLabel },
                description: { "en-US": `Option in step ${stepKey}` },
                type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                interactionType: "choice",
            },
        },
    };
}

export function makeScrollStatement({ user, stageId, stepKey, y, dy = null }) {
    const objectId = `urn:future-design:ui:stage/${stageId}/step/${stepKey}/viewport`;
    return {
        actor: buildActor(user),
        timestamp: new Date().toISOString(),
        verb: { id: "http://adlnet.gov/expapi/verbs/interacted", display: { "en-US": "interacted" } },
        object: {
            id: objectId,
            objectType: "Activity",
            definition: {
                name: { "en-US": "Viewport" },
                description: { "en-US": "User scrolled the step viewport." },
                type: "http://adlnet.gov/expapi/activities/media",
            },
        },
        result: {
            extensions: {
                "https://futuredesign.app/xapi/ext/scrollY": y,
                "https://futuredesign.app/xapi/ext/scrollDelta": dy,
            },
        },
    };
}

// ---------- Logger wrappers (append to bundle) ----------

export function makeKeydownLogger({ user, stageId, stepKey }) {
    return async function handleKeyDown(e) {
        try {
            const el = e.target;
            const meta = {
                cursorStart: typeof el.selectionStart === "number" ? el.selectionStart : null,
                cursorEnd: typeof el.selectionEnd === "number" ? el.selectionEnd : null,
            };
            const stmt = makeKeystrokeStatement(user, stageId, stepKey, e.key, meta);
            appendXapiToStage(user, stageId, stmt);
        } catch (err) {
            await logClientError({
                error: err,
                source: "makeKeydownLogger",
                reason: `stageId=${stageId} stepKey=${stepKey}`,
            });
        }
    };
}

export function makeScrollLogger({ user, stageId, stepKey, throttleMs = 200 }) {
    let lastTime = 0;
    let lastY = 0;
    return async function handleScroll(e) {
        try {
            const now = Date.now();
            if (now - lastTime < throttleMs) return;

            const target = e.target.scrollingElement || e.target;
            const y = target.scrollTop;
            const dy = y - lastY;

            const stmt = makeScrollStatement({ user, stageId, stepKey, y, dy });
            appendXapiToStage(user, stageId, stmt);

            lastTime = now;
            lastY = y;
        } catch (err) {
            await logClientError({
                error: err,
                source: "makeScrollLogger",
                reason: `stageId=${stageId} stepKey=${stepKey}`,
            });
        }
    };
}

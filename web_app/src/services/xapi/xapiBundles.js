import { logClientError } from "../errorHandle/logClientError";
import { safeLogToFirebase } from "../errorHandle/safeLog";

const MAX_DOC_BYTES = 800 * 1024;
const GLOBAL_XAPI_COLLECTION = "xapi_statements";
const GLOBAL_XAPI_QUEUE = "xapi_statements_queue";

const lsKey = (uid, stageId) => `xapi:bundle:${uid}:${stageId}`;
const lsSeqKey = (uid, stageId) => `xapi:bundleSeq:${uid}:${stageId}`;

function readLocal(uid, stageId) {
    try {
        const raw = localStorage.getItem(lsKey(uid, stageId));
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        logClientError({ error: err, source: "xapiBundles.readLocal", reason: `uid=${uid} stageId=${stageId}` });
        localStorage.removeItem(lsKey(uid, stageId));
        return [];
    }
}

function writeLocal(uid, stageId, arr) {
    try {
        localStorage.setItem(lsKey(uid, stageId), JSON.stringify(arr));
    } catch (err) {
        logClientError({ error: err, source: "xapiBundles.writeLocal", reason: `uid=${uid} stageId=${stageId}` });
    }
}

function clearLocal(uid, stageId) {
    localStorage.removeItem(lsKey(uid, stageId));
}

function nextBundleSeq(uid, stageId) {
    const k = lsSeqKey(uid, stageId);
    const n = parseInt(localStorage.getItem(k) || "0", 10) + 1;
    localStorage.setItem(k, String(n));
    return n;
}

export function appendXapiToStage(user, stageId, statement) {
    const uid = user?.uid || "anon";
    const arr = readLocal(uid, stageId);
    arr.push(statement);
    writeLocal(uid, stageId, arr);
    return arr.length;
}

export function getLocalStageBundle(user, stageId) {
    const uid = user?.uid || "anon";
    return readLocal(uid, stageId);
}

export function clearLocalStageBundle(user, stageId) {
    const uid = user?.uid || "anon";
    clearLocal(uid, stageId);
}

export async function flushStageBundleToGlobalXapi({ user, stageId }) {
    const uid = user?.uid;
    if (!uid) {
        await logClientError({
            error: new Error("missing user.uid"),
            source: "xapiBundles.flushGlobal",
            reason: `stageId=${stageId}`,
        });
        return [];
    }

    const bundle = readLocal(uid, stageId);
    if (!bundle.length) return [];

    const chunks = chunkByBytes(bundle, MAX_DOC_BYTES);
    const results = [];

    try {
        for (const statements of chunks) {
            const seq = nextBundleSeq(uid, stageId);

            const payload = {
                kind: "singleMovementBundle",
                uid,
                stageId,
                seq,
                createdAt: new Date().toISOString(),
                statements, // full statements for Python analysis
            };

            await safeLogToFirebase({
                collectionName: GLOBAL_XAPI_COLLECTION,
                queueKey: GLOBAL_XAPI_QUEUE,
                data: payload,
            });

            results.push({ seq, count: statements.length });
        }

        clearLocal(uid, stageId);
        return results;
    } catch (err) {
        await logClientError({
            error: err,
            source: "xapiBundles.flushGlobal",
            reason: `uid=${uid} stageId=${stageId} chunkCount=${chunks.length}`,
        });
        return [];
    }
}

// ---- Utilities ----
function byteLen(obj) {
    try {
        return new Blob([JSON.stringify(obj)]).size;
    } catch {
        return JSON.stringify(obj).length;
    }
}

function chunkByBytes(items, maxBytes) {
    const out = [];
    let cur = [];
    for (const it of items) {
        const test = cur.concat([it]);
        const testBytes = byteLen({ statements: test });
        if (testBytes > maxBytes && cur.length) {
            out.push(cur);
            cur = [it];
        } else {
            cur = test;
        }
    }
    if (cur.length) out.push(cur);
    return out;
}

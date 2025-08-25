import { safeLogToFirebase } from '../errorHandle/safeLog';
import { buildActor } from './common/buildActor';


function nextSeq(objectId) {
    const k = `xapi:seq:${objectId}`;
    const n = Number(localStorage.getItem(k) || '0') + 1;
    localStorage.setItem(k, String(n));
    return n;
}

/**
 * Log a single keystroke (very light payload).
 * @param {FirebaseUser} user
 * @param {string} objectId  stable ID of the field, e.g. "pretest:s1:text"
 * @param {string} key       e.g. "a", "Backspace", "Enter"
 * @param {object} meta      optional { cursorStart, cursorEnd, selectionLength, seq, composing }
 */
export async function sendKeystrokeStatement(user, objectId, key, meta = {}) {
    const statement = {
        actor: buildActor(user),
        verb: {
            id: 'http://adlnet.gov/expapi/verbs/interacted',
            display: { 'en-US': 'interacted' },
        },
        object: {
            id: `urn:future-design-app:field:${objectId}`,
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
                'https://futuredesign.app/xapi/ext/key': key, // one character or special key name
                'https://futuredesign.app/xapi/ext/cursorStart': meta.cursorStart ?? null,
                'https://futuredesign.app/xapi/ext/cursorEnd': meta.cursorEnd ?? null,
                'https://futuredesign.app/xapi/ext/seq': meta.seq ?? nextSeq(objectId),
            },
        },

        timestamp: new Date().toISOString(),
    };

    await safeLogToFirebase({
        collectionName: 'xapi_statements',
        data: statement,
        queueKey: 'xapi_statements',
    });
}



export function makeKeydownLogger({ user, objectId, element }) {
    return async function handleKeyDown(e) {
        if (!user || !objectId) return;

        const el = element || e.target;
        const start = typeof el?.selectionStart === 'number' ? el.selectionStart : null;
        const end = typeof el?.selectionEnd === 'number' ? el.selectionEnd : null;

        await sendKeystrokeStatement(user, objectId, e.key, {
            cursorStart: start,
            cursorEnd: end,
        });
    };
}

import { buildActor } from "./common/buildActor";
import { safeLogToFirebase } from '../errorHandle/safeLog';



/**
 * Create a single xAPI "answered" statement for a step's full answers.
 * Pure function: NO side effects.
 *
 * @param {FirebaseUser} user
 * @param {object} opts
 *   - stageId:   "training" | "posttest" | "survey" | "consent" | "welcome"
 *   - stepKey:   e.g. "training-plan", "training-goal", 'q1'
 *   - answers:   structured answers 
 */
export function answerStatement(user, {
    stageId,
    stepKey,
    answers,
}) {
    const objectId = `urn:future-design-app:stage/${stageId}/step/${stepKey}`;
    const response = String(answers ?? "");


    const stmt = {
        actor: buildActor(user),
        verb: {
            id: "http://adlnet.gov/expapi/verbs/answered",
            display: { "en-US": "answered" },
        },
        object: {
            id: objectId,
            objectType: "Activity",
            definition: {
                name: { "en-US": `Full answers for ${stepKey}` },
                description: { "en-US": `All fields submitted for ${stageId}/${stepKey}` },
                type: "http://adlnet.gov/expapi/activities/cmi.interaction",
                interactionType: "other",
            },
        },
        result: {
            response: response,
        },
        timestamp: new Date().toISOString(),
    };

    return stmt;
}


export const sendAnswerStatement = async (user, stageId, answersObj) => {
    const statements = Object.entries(answersObj).map(([stepKey, value]) =>
        answerStatement(user, {
            stageId,
            stepKey,
            answers: String(value ?? '')
        })
    );

    const finalAnswer = {
        type: `answeres for stage ${stageId}`,
        stageId,
        actor: statements[0]?.actor,
        answers: statements,
        createdAt: new Date().toISOString(),
    }

    await safeLogToFirebase({
        collectionName: 'xapi_statements',
        data: finalAnswer,
        queueKey: 'xapi_statements'
    })
};


export function conversationTranscriptStatement(user, {
    stageId,             // "training"
    conversationId,      // "trainingAiConversation"
    transcript,          // { activeId, messages:[{role,text}], branchesMeta: [...] }
}) {
    const objectId = `urn:future-design:conversation/${stageId}/${conversationId}`;
    return {
        actor: buildActor(user),
        timestamp: new Date().toISOString(),
        verb: { id: "http://adlnet.gov/expapi/verbs/interacted", display: { "en-US": "interacted" } },
        object: {
            id: objectId,
            objectType: "Activity",
            definition: {
                name: { "en-US": "Full AI conversation transcript" },
                description: { "en-US": `Active branch transcript for ${conversationId}` },
                type: "http://adlnet.gov/expapi/activities/media",
            },
        },
        result: {
            extensions: {
                "https://futuredesign.app/xapi/ext/activeBranch": transcript.activeId,
                "https://futuredesign.app/xapi/ext/messages": transcript.messages,        // ordered turns
                "https://futuredesign.app/xapi/ext/branches": transcript.branchesMeta,    // optional meta
                "https://futuredesign.app/xapi/ext/messageCount": transcript.messages.length,
            },
        },
    };
}

export async function sendConversationTranscript(user, {
    stageId,
    conversationId,
    transcript,
}) {
    const stmt = conversationTranscriptStatement(user, { stageId, conversationId, transcript });

    const payload = {
        type: "conversation transcript",
        stageId,
        conversationId,
        actor: stmt.actor,
        statement: stmt,
        createdAt: new Date().toISOString(),
    };

    await safeLogToFirebase({
        collectionName: 'xapi_statements',
        data: payload,
        queueKey: 'xapi_statements',
    });
}
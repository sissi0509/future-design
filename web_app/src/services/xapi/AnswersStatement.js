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
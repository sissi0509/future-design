import { safeLogToFirebase } from '../errorHandle/safeLog';
import { buildActor } from './common/buildActor';

export const sendLogoutStatement = async (user) => {
    const statement = {
        actor: buildActor(user),
        verb: {
            id: 'https://brindlewaye.com/xAPITerms/verbs/loggedout/',
            display: { 'en-US': 'logged out' }
        },
        object: {
            id: 'urn:future-design-app:logout',
            "objectType": "Activity",
            definition: {
                name: { 'en-US': "Logout" },
                description: { 'en-US': "The learner logged out of the Future-Design training platform." }
            }
        },
        timestamp: new Date().toISOString()
    };

    await safeLogToFirebase({
        collectionName: 'xapi_statements',
        data: statement,
        queueKey: 'xapi_statements'
    })
};
import { safeLogToFirebase } from '../errorHandle/safeLog';

export const sendLoginStatement = async (userEmail) => {
    const statement = {
        actor: {
            name: userEmail,
            mbox: `mailto:${userEmail}`
        },
        verb: {
            id: 'https://brindlewaye.com/xAPITerms/verbs/loggedin/',
            display: { 'en-US': 'logged in' }
        },
        object: {
            id: 'urn:e-learning-app:login',
            definition: {
                name: { 'en-US': 'E-learning App' },
                description: { 'en-US': 'An AI-powered training app writing.' }
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
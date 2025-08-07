import { serverTimestamp } from 'firebase/firestore';
import { auth } from '../../config/Firebase';
import { safeLogToFirebase } from './safeLog';


export const logClientError = async ({ error, source, reason }) => {

    const user = auth.currentUser;
    const errorData = {
        uid: user?.uid || null,
        email: user?.email || null,
        message: error.message || "Unknown error",
        stack: error.stack || "",
        source: source || "Unknown source",
        reason: reason || "No reason provided",
        timestamp: serverTimestamp()
    };

    await safeLogToFirebase({
        collectionName: 'clientErrors',
        data: errorData,
        queueKey: 'clientErrors'
    });

}


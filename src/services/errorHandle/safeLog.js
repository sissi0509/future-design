import { db } from '../../config/Firebase';
import { addDoc, collection } from 'firebase/firestore';


export const safeLogToFirebase = async ({ collectionName, data, queueKey }) => {

    try {
        await addDoc(collection(db, collectionName), data);

    } catch (error) {
        console.error(`Firebase failed for ${collectionName}:`, error);

        try {
            const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
            queue.push(data);
            localStorage.setItem(queueKey, JSON.stringify(queue));
            console.log(`Saved to localStorage[${queueKey}]:`, queue);

        } catch (localError) {
            console.error(`Failed to save to localStorage[${queueKey}]:`, localError);
        }


    }
};



export const flushErroLogQueue = async ({ collectionName, queueKey }) => {
    const raw = localStorage.getItem(queueKey);
    if (!raw) return;

    const queue = JSON.parse(raw);
    const remaining = [];

    for (const statement of queue) {
        try {
            await addDoc(collection(db, collectionName), statement);
        } catch (error) {
            remaining.push(statement);
        }
    }

    localStorage.setItem(queueKey, JSON.stringify(remaining));
};
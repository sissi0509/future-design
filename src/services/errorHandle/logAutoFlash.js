import { flushErroLogQueue } from './safeLog';

const log_storage_list = [
    { collectionName: 'clientErrors', queueKey: 'clientErrors' },
    { collectionName: 'xapi_statements', queueKey: 'xapi_statements' },
];


export const logAutoFlush = () => {
    const flushAll = () => {
        log_storage_list.forEach(({ collectionName, queueKey }) => {
            flushErroLogQueue({ collectionName, queueKey });
        });
    };

    flushAll();

    const interval = setInterval(flushAll, 15000);

    window.addEventListener('online', flushAll);

    return () => {
        clearInterval(interval);
        window.removeEventListener('online', flushAll);
        console.log('Cleanup ran!');
    };
};
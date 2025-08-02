import { useState, useEffect } from 'react';
import { useAuth } from '../components/User/AuthSetUp';
import { runTransaction, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';
import { logClientError } from '../services/errorHandle/logClientError';

import Welcome from './Welcome';
import Consent from './Consent';
import PreTest from './PreTest';
import Training from './Training';
import PostTest from './PostTest';
import Survey from './Survey';
import QRCode from './QRCode'

export default function NewHome() {
    const { currentUser } = useAuth();
    const [localProgress, setLocalProgress] = useState(null);

    useEffect(() => {
        const loadOrCreateProgress = async () => {
            if (!currentUser) return;

            const docRef = doc(db, "sessionInfo", currentUser.uid);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                setLocalProgress(snapshot.data());
            } else {
                const defaultProgress = {
                    uid: currentUser.uid,
                    welcomeCompleted: false,
                    consentCompleted: false,
                    preTestCompleted: false,
                    trainingCompleted: false,
                    postTestCompleted: false,
                    surveyCompleted: false,
                    groupNumber: null
                };
                await setDoc(docRef, defaultProgress);
                setLocalProgress(defaultProgress);
            }
        };

        loadOrCreateProgress();
    }, [currentUser]);



    const assignGroupNumber = async () => {
        const countsRef = doc(db, 'sessionInfo', 'groupCounts');

        const chosenGroup = await runTransaction(db, async (transaction) => {
            const snapshot = await transaction.get(countsRef);
            if (!snapshot.exists()) throw new Error("groupCounts doc not found");

            const counts = snapshot.data();

            const minCount = Math.min(...Object.values(counts));
            const candidates = Object.keys(counts).filter(
                (k) => counts[k] === minCount
            );

            const selected = candidates[Math.floor(Math.random() * candidates.length)];
            transaction.update(countsRef, {
                [selected]: counts[selected] + 1
            });

            return parseInt(selected);
        });

        return chosenGroup;
    };

    const markComplete = async (stage) => {
        if (!currentUser) return;

        try {
            const docRef = doc(db, "sessionInfo", currentUser.uid);
            const updated = { ...localProgress, [stage]: true };

            if (stage === 'consentCompleted' && localProgress.groupNumber == null) {
                const groupNum = await assignGroupNumber();
                updated.groupNumber = groupNum;
            }

            setLocalProgress(updated);
            await setDoc(docRef, updated);
        } catch (error) {
            await logClientError({
                error,
                source: 'NewHome.jsx → markComplete',
                reason: `Error updating stage "${stage}" for user`
            });
        }
    };


    if (!localProgress) {
        return <div className="p-4">Loading...</div>;
    }

    if (!localProgress.welcomeCompleted) {
        return <Welcome onComplete={() => markComplete('welcomeCompleted')} />;
    } else if (!localProgress.consentCompleted) {
        return <Consent onComplete={() => markComplete('consentCompleted')} />;
    } else if (!localProgress.preTestCompleted) {
        return <PreTest onComplete={() => markComplete('preTestCompleted')} />;
    } else if (!localProgress.trainingCompleted) {
        return <Training onComplete={() => markComplete('trainingCompleted')} />;
    } else if (!localProgress.postTestCompleted) {
        return <PostTest onComplete={() => markComplete('postTestCompleted')} />;
    } else if (!localProgress.surveyCompleted) {
        return <Survey onComplete={() => markComplete('surveyCompleted')} />;
    } else {
        return <QRCode />;
    }
}

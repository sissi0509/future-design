import { useState, useEffect } from 'react';
import { useAuth } from '../components/User/AuthSetUp';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';
import { logClientError } from '../services/errorHandle/logClientError';
import Header from '../components/Header';
import Auth from '../components/User/Auth'

import Welcome from './Welcome';
import Consent from './Consent';
import PreTest from './PreTest';
import Training from './Training';
import PostTest from './PostTest';
import Survey from './Survey';
import QRCode from './QRCode'

const getFlag = (obj, path) =>
    path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj) === true;

const setFlagTrue = async (uid, path) => {
    const ref = doc(db, 'sessionInfo', uid);
    await updateDoc(ref, { [path]: true });
};


export default function Home() {
    const { currentUser } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // const loadProgress = async () => {
    //     if (!currentUser) return;

    //     const docRef = doc(db, "sessionInfo", currentUser.uid);
    //     const snapshot = await getDoc(docRef);

    //     if (snapshot.exists()) {
    //         setLocalProgress(snapshot.data());
    //     } else {
    //         setLocalProgress(null);
    //         await logClientError({
    //             error,
    //             source: 'login',
    //             reason: 'no user info found in sessionInfo'
    //         });
    //     }
    // };

    useEffect(() => {
        const load = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const ref = doc(db, 'sessionInfo', currentUser.uid);
                const snap = await getDoc(ref);
                setData(snap.exists() ? snap.data() : {});
            } catch (e) {
                await logClientError({
                    error: e,
                    source: 'Home.jsx → load',
                    reason: 'Failed to load sessionInfo',
                });
                setData({});
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [currentUser]);

    // useEffect(() => {
    //     if (currentUser) {
    //         loadProgress();
    //     }
    // }, [currentUser]);


    // // previous version: login to create session file
    // useEffect(() => {
    //     const loadOrCreateProgress = async () => {
    //         if (!currentUser) return;

    //         const docRef = doc(db, "sessionInfo", currentUser.uid);
    //         const snapshot = await getDoc(docRef);

    //         if (snapshot.exists()) {
    //             setLocalProgress(snapshot.data());
    //         } else {
    //             const defaultProgress = {
    //                 uid: currentUser.uid,
    //                 welcomeCompleted: false,
    //                 consentCompleted: false,
    //                 preTestCompleted: false,
    //                 trainingCompleted: false,
    //                 postTestCompleted: false,
    //                 surveyCompleted: false,
    //                 groupNumber: null
    //             };
    //             await setDoc(docRef, defaultProgress);
    //             setLocalProgress(defaultProgress);
    //         }
    //     };

    //     loadOrCreateProgress();
    // }, [currentUser]);


    // // assignGroupNumber function
    // const assignGroupNumber = async () => {
    //     const countsRef = doc(db, 'megaData', 'groupCounts');

    //     const chosenGroup = await runTransaction(db, async (transaction) => {
    //         const snapshot = await transaction.get(countsRef);
    //         if (!snapshot.exists()) throw new Error("groupCounts doc not found");

    //         const counts = snapshot.data();

    //         const minCount = Math.min(...Object.values(counts));
    //         const candidates = Object.keys(counts).filter(
    //             (k) => counts[k] === minCount
    //         );

    //         const selected = candidates[Math.floor(Math.random() * candidates.length)];
    //         transaction.update(countsRef, {
    //             [selected]: counts[selected] + 1
    //         });

    //         return parseInt(selected);
    //     });

    //     return chosenGroup;
    // };

    // const markComplete = async (stage) => {
    //     if (!currentUser) return;

    //     try {
    //         const docRef = doc(db, "sessionInfo", currentUser.uid);
    //         const updated = { ...localProgress, [stage]: true };

    //         // if (stage === 'consentCompleted' && localProgress.groupNumber == null) {
    //         //     const groupNum = await assignGroupNumber();
    //         //     updated.groupNumber = groupNum;
    //         // }

    //         setLocalProgress(updated);
    //         await setDoc(docRef, updated);
    //     } catch (error) {
    //         await logClientError({
    //             error,
    //             source: 'NewHome.jsx → markComplete',
    //             reason: `Error updating stage "${stage}" for user`
    //         });
    //     }
    // };

    const markComplete = async (flagPath) => {
        if (!currentUser) return;
        try {
            setData((prev) => {
                const next = { ...(prev || {}) };
                const keys = flagPath.split('.');
                let cur = next;
                for (let i = 0; i < keys.length - 1; i++) {
                    cur[keys[i]] = cur[keys[i]] || {};
                    cur = cur[keys[i]];
                }
                cur[keys[keys.length - 1]] = true;
                return next;
            });

            await setFlagTrue(currentUser.uid, flagPath);
        } catch (e) {
            await logClientError({
                error: e,
                source: 'Home.jsx → markComplete',
                reason: `Failed ${flagPath}`
            });
        }
    };

    if (!currentUser) {
        return (
            <div className="p-4 text-center">
                <p className="mb-4">Please login to continue.</p>
                <Auth />
            </div>
        );
    }


    if (loading || !data) {
        return <div className="p-4">Loading...</div>;
    }


    const FLOW = [
        { path: 'progress.welcomeCompleted', render: () => <Welcome onComplete={() => markComplete('progress.welcomeCompleted')} /> },
        { path: 'progress.consentCompleted', render: () => <Consent onComplete={() => markComplete('progress.consentCompleted')} /> },
        { path: 'progress.preTestCompleted', render: () => <PreTest onComplete={() => markComplete('progress.preTestCompleted')} /> },
        { path: 'progress.training.trainingCompleted', render: () => <Training onComplete={() => markComplete('progress.training.trainingCompleted')} /> },
        { path: 'progress.postTestCompleted', render: () => <PostTest onComplete={() => markComplete('progress.postTestCompleted')} /> },
        { path: 'progress.surveyCompleted', render: () => <Survey onComplete={() => markComplete('progress.surveyCompleted')} /> },
    ];

    const next = FLOW.find(({ path }) => !getFlag(data, path));


    // let currentStepComponent;

    // if (!localProgress.welcomeCompleted) {
    //     currentStepComponent = <Welcome onComplete={() => markComplete('welcomeCompleted')} />;
    // } else if (!localProgress.consentCompleted) {
    //     currentStepComponent = <Consent onComplete={() => markComplete('consentCompleted')} />;
    // } else if (!localProgress.preTestCompleted) {
    //     currentStepComponent = <PreTest onComplete={() => markComplete('preTestCompleted')} />;
    // } else if (!localProgress.trainingCompleted) {
    //     currentStepComponent = <Training onComplete={() => markComplete('trainingCompleted')} />;
    // } else if (!localProgress.postTestCompleted) {
    //     currentStepComponent = <PostTest onComplete={() => markComplete('postTestCompleted')} />;
    // } else if (!localProgress.surveyCompleted) {
    //     currentStepComponent = <Survey onComplete={() => markComplete('surveyCompleted')} />;
    // } else {
    //     currentStepComponent = <QRCode />;
    // }

    return (
        <>
            <Header progress={data?.progress || {}} />
            {next ? next.render() : <QRCode />}
        </>
    );

}

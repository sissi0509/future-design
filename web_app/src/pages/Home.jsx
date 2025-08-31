import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/User/AuthSetUp';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';
import { logClientError } from '../services/errorHandle/logClientError';
import Header from '../components/Header';
import Auth from '../components/User/Auth'
import { sendAnswerStatement } from '../services/xapi/AnswersStatement';
import { flushStageBundleToGlobalXapi } from '../services/xapi/xapiBundles'
import { attachGlobalCopyPaste } from '../services/xapi/globalCopyPaste'

import Welcome from './Welcome';
import Consent from './Consent';
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
    const detachRef = useRef(null)

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

    useEffect(() => {
        if (!currentUser?.uid) return;

        if (detachRef.current) {
            detachRef.current();
            detachRef.current = null;
        }

        detachRef.current = attachGlobalCopyPaste({
            user: currentUser,
            defaultStageId: 'app',
            defaultStepKey: 'global',
        });

        return () => {
            if (detachRef.current) {
                detachRef.current();
                detachRef.current = null;
            }
        };
    }, [currentUser?.uid]);

    const groupNumber = Number(data?.groupNumber ?? 3);

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

    const saveAnswers = async (uid, { type, answers, flagPath }) => {

        await setDoc(
            doc(db, "sessionInfo", uid, "responses", type),
            {
                type,
                ...answers,
                submitted: true,
                status: "final-submit",
            },
            { merge: true }
        );

        await updateDoc(doc(db, "sessionInfo", uid), { [flagPath]: true });


        await sendAnswerStatement(currentUser, type, answers);
        await flushStageBundleToGlobalXapi({ user: currentUser, stageId: type })


    }
    //save then optimistically update local state via markComplete
    const saveAndComplete = async ({ type, flagPath, answers }) => {
        if (!currentUser?.uid) return;
        await saveAnswers(currentUser.uid, { type, answers, flagPath });
        await markComplete(flagPath); // keeps your local `data` in sync
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
        {
            path: 'progress.welcomeCompleted',
            render: () => <Welcome currentUser={currentUser} onComplete={() => markComplete('progress.welcomeCompleted')} />
        },

        {
            path: 'progress.consentCompleted',
            render: () => <Consent currentUser={currentUser} onComplete={() => markComplete('progress.consentCompleted')} />
        },

        {
            path: 'progress.training.trainingCompleted',
            render: () => <Training
                currentUser={currentUser}
                group={groupNumber}
                onComplete={() => markComplete('progress.training.trainingCompleted')}
            />
        },

        {
            path: 'progress.postTestCompleted',
            render: () => (
                <PostTest
                    currentUser={currentUser}
                    onSubmit={(answers) =>
                        saveAndComplete({ type: 'postTest', flagPath: 'progress.postTestCompleted', answers })
                    }
                />
            )
        },

        {
            path: 'progress.surveyCompleted',
            render: () => (
                <Survey
                    currentUser={currentUser}
                    onSubmit={(answers) =>
                        saveAndComplete({ type: 'survey', flagPath: 'progress.surveyCompleted', answers })
                    }
                />
            )
        },
    ];

    const next = FLOW.find(({ path }) => !getFlag(data, path));

    return (
        <>
            <Header progress={data?.progress || {}} />
            {next ? next.render() : <QRCode />}
        </>
    );

}

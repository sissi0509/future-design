import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../components/User/AuthSetUp";
import { db } from "../config/Firebase";
import LevelBoardModules from "../components/training/LevelBoard";
import StepPage from "../components/training/StepPage";
import { logClientError } from '../services/errorHandle/logClientError';

// Map Firestore -> board shape
function normalizeCompleted(progress) {
    const out = {};
    const training = progress?.training || {};

    // ensure stages 1..5 exist (missing -> false)
    for (let i = 1; i <= 5; i++) {
        const s = training[`stage${i}`] || {};
        out[i] = {
            practice: !!s.practiceCompleted,
            evaluation: !!s.evaluationCompleted,
            revision: !!s.revisionCompleted,
        };
    }
    return out;
}

export default function Training() {
    const { currentUser } = useAuth();
    const [screen, setScreen] = useState({ view: "board" });
    const [completed, setCompleted] = useState({});

    // Realtime subscribe to sessionInfo/{uid}
    useEffect(() => {
        if (!currentUser?.uid) return;

        const ref = doc(db, "sessionInfo", currentUser.uid);
        const unsub = onSnapshot(
            ref,
            (snap) => {
                const data = snap.data() || {};
                const progress = data.progress || {};
                setCompleted(normalizeCompleted(progress));
            },
            (err) => {
                logClientError({
                    error: err,
                    source: "Training.jsx → onSnapshot",
                    reason: "Failed to subscribe to sessionInfo",
                });
            }
        );
        return unsub;
    }, [currentUser?.uid]);

    if (screen.view === "board") {
        return (
            <LevelBoardModules
                completed={completed}
                onOpen={(stage, step) => setScreen({ view: "step", stage, step })}
            />
        );
    }

    if (screen.view === "step") {
        return (
            <StepPage
                stage={screen.stage}
                step={screen.step}
                onBackToBoard={() => setScreen({ view: "board" })}
                onFinishedStep={() => {
                    setScreen({ view: "board" });
                }}
            />
        );
    }

    return null;
}

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../components/User/AuthSetUp";
import { db } from "../config/Firebase";
import LevelBoard from "../components/training/LevelBoard";
import StepPage from "../components/training/StepPage";
import { logClientError } from "../services/errorHandle/logClientError";
import TrainingInstructions from '../data/questions/training/instructions'

export default function Training({ onComplete }) {
    const { currentUser } = useAuth();

    const [view, setView] = useState("board");
    const [activeStep, setActiveStep] = useState("evaluation"); // "evaluation" | "revision"
    const [completed, setCompleted] = useState({ evaluation: false, revision: false });

    useEffect(() => {

        if (!currentUser?.uid) return;
        const ref = doc(db, "sessionInfo", currentUser.uid);
        const unsub = onSnapshot(
            ref,
            (snap) => {
                const data = snap.data() || {};
                const training = data.progress?.training || {};
                setCompleted({
                    evaluation: !!training.evaluationCompleted,
                    revision: !!training.revisionCompleted,
                });
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

    const items = [
        { id: "evaluation", label: "Evaluation", done: completed.evaluation },
        { id: "revision", label: "Revision", done: completed.revision },
    ];
    const canSubmit = completed.evaluation && completed.revision;

    if (view === "board") {
        return (
            <LevelBoard
                instructions={TrainingInstructions}
                items={items}
                onSelect={(id) => {
                    setActiveStep(id);
                    setView("step");
                }}
                canSubmit={canSubmit}
                onSubmit={() => {
                    if (!canSubmit) return;
                    onComplete?.(); // marks progress.training.trainingCompleted true
                }}
            />
        );
    }

    if (view === "step") {
        return (
            <StepPage
                step={activeStep}
                onBackToBoard={() => setView("board")}
                onFinishedStep={() => setView("board")} // StepPage writes completion to Firestore
            />
        );
    }

    return null;
}

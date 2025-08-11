// src/pages/Training.jsx (simplified)
import { useState } from "react";
import LevelBoardModules from "../components/training/LevelBoard";
import StepPage from "../components/training/StepPage";

export default function Training() {
    const [screen, setScreen] = useState({ view: "board" });

    if (screen.view === "board") {
        return (
            <LevelBoardModules
                unlocked={{ "0": { practice: true }, final: false }}
                completed={{}}
                onOpen={(stage, step) => {
                    if (stage === 0 && step === "practice") {
                        setScreen({ view: "step", stage, step });
                    }
                }}
            />
        );
    }

    if (screen.view === "step") {
        return (
            <StepPage
                step={screen.step}           // "practice"
                onBackToBoard={() => setScreen({ view: "board" })}
                onFinishedStep={(which, answers) => {
                    // TODO: save to Firestore, mark Stage1/Practice completed, unlock evaluation
                    setScreen({ view: "board" });
                }}
            />
        );
    }

    return null;
}

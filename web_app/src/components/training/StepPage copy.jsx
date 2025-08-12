import { useEffect, useState } from "react";
import ChatBoxAI from "./ChatBoxAI";
import PracticeStep from "./PracticeStep";

export default function StepPage({
    step = "practice",
    onBackToBoard,
    onFinishedStep,
}) {
    const LS_KEY = "aiCoachCollapsed";
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(LS_KEY);
        if (saved != null) setCollapsed(saved === "1");
    }, []);
    useEffect(() => {
        localStorage.setItem(LS_KEY, collapsed ? "1" : "0");
    }, [collapsed]);

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Outer frame with fixed height; adjust as you like */}
            <div className="border rounded-xl overflow-hidden h-[80vh]">
                {/* Two-column layout */}
                <div className="relative flex h-full">
                    {/* LEFT: Practice content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        {/* Top bar */}
                        <div className="px-4 py-3 border-b bg-base-100 flex items-center justify-between">
                            <div className="font-medium">Practice</div>
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() => setCollapsed(c => !c)}
                                title={collapsed ? "Show AI Coach" : "Hide AI Coach"}
                            >
                                {collapsed ? "Show Coach" : "Hide Coach"}
                            </button>
                        </div>

                        {/* Scrollable practice area */}
                        <div className="p-4 flex-1 overflow-auto">
                            {step === "practice" && (
                                <PracticeStep
                                    onBack={onBackToBoard}
                                    onComplete={(answers) =>
                                        onFinishedStep?.("practice", answers)
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Collapsible AI Coach */}
                    <div
                        className={[
                            "bg-base-200 border-l transition-[width] duration-200 ease-in-out h-full relative",
                            collapsed ? "w-0" : "w-96",
                            collapsed ? "border-l-0" : "border-l",
                        ].join(" ")}
                        aria-hidden={collapsed}
                    >
                        {/* Keep content mounted; fade/pointer-events for smooth collapse */}
                        <div
                            className={[
                                "absolute inset-0 flex flex-col transition-opacity duration-150",
                                collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
                            ].join(" ")}
                        >
                            {/* Make AI area scroll independently */}
                            <div className="flex-1 overflow-auto">
                                <ChatBoxAI title="AI Coach" />
                            </div>
                        </div>
                    </div>

                    {/* Optional small handle near the divider (mobile-friendly) */}
                    {/* <button
            className="btn btn-xs btn-ghost absolute top-2 right-2 z-10"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? "Open coach" : "Close coach"}
          >
            {collapsed ? "⟨⟨" : "⟩⟩"}
          </button> */}
                </div>
            </div>
        </div>
    );
}

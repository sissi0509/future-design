import ChatBubbles from "./ChatBubbles";

export default function StarterPanel({ onPick, disabled, bubbles, starter }) {
    return (
        <div className="space-y-3">
            <div className="flex  justify-start px-3 py-2 rounded-lg whitespace-pre-wrap break-words bg-base-300">
                {starter}
            </div>

            {/* Right: vertical bubble list */}
            <div className="flex justify-end">
                <div className="inline-block max-w-[85%]  bg-base-100 p-4">
                    <ChatBubbles
                        starters={bubbles}
                        onPick={onPick}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
}

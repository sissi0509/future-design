import { useEffect, useRef } from "react";

export default function ChatBubbles({
    starters = [],
    onPick,
    disabled = false,
}) {
    const ref = useRef(null);
    useEffect(() => {
        const first = ref.current?.querySelector('button[data-bubble]');
        first?.focus();
    }, []);

    const items = starters.map((s, i) => ({ id: String(i), text: s.text }));
    if (!items.length) return null;

    return (
        <div className="mb-2">

            <div
                ref={ref}
                className="flex flex-col gap-2"
            >
                {items.map(({ id, text }) => (
                    <button
                        key={id}
                        data-bubble
                        type="button"
                        disabled={disabled}
                        onClick={() => onPick?.(text)}
                        onKeyDown={(e) => {
                            if (disabled) return;
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onPick?.(text);
                            }
                        }}
                        className={[
                            "btn rounded-2xl border border-base-200 shadow-sm hover:shadow",
                            disabled ? "btn-disabled opacity-60" : ""
                        ].join(" ")}
                        title={text}
                    >
                        {text}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function ResizableSidebar({
    width,
    min,
    max,
    collapsed,
    onResizeStart,
    children,
}) {
    return (
        <div
            className={[
                "bg-base-200 h-full relative",
                collapsed ? "border-l-0" : "border-l",
            ].join(" ")}
            style={{
                width: collapsed ? 0 : width,
                minWidth: collapsed ? 0 : min,
                maxWidth: collapsed ? "none" : max,
            }}
            aria-hidden={collapsed}
        >
            {!collapsed && (
                <button
                    type="button"
                    aria-label="Resize"
                    onMouseDown={onResizeStart}
                    onTouchStart={onResizeStart}
                    title="Drag to resize"
                    className="absolute left-0 bottom-0 z-30 w-6 h-6 grid place-items-center
                     rounded-tr bg-base-300/90 hover:bg-base-300 shadow-sm ring-1 ring-base-content/20"
                    style={{ cursor: "ew-resize", touchAction: "none" }}
                >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-base-content/70">
                        <path d="M8 5l-5 7 5 7M16 5l5 7-5 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}

            {/* Lower z-index so the handle sits on top */}
            <div
                className={[
                    "absolute inset-0 z-10 flex flex-col",
                    collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
                    "transition-opacity duration-150",
                ].join(" ")}
            >
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

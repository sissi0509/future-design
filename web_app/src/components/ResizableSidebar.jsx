import { useState } from "react";

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
            className="group h-full relative"
            style={{
                width: collapsed ? 0 : width,
                minWidth: collapsed ? 0 : min,
                maxWidth: collapsed ? "none" : max,
            }}
            aria-hidden={collapsed}
        >
            {/* Invisible drag rail (no visuals) */}
            {!collapsed && (
                <>
                    <div
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Resize"
                        onMouseDown={onResizeStart}
                        onTouchStart={onResizeStart}
                        className="absolute left-0 top-0 h-full w-4 z-30 cursor-ew-resize select-none"
                        style={{ touchAction: "none", background: "transparent" }}
                    />

                    {/* // very subtle 1px hairline hint on hover (keeps clicks for content) */}
                    <div
                        className="absolute left-0 top-0 h-full w-px bg-base-content/10
                       opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        aria-hidden
                    />
                </>
            )}

            {/* Content */}
            <div
                className={[
                    "absolute inset-0 z-10 flex flex-col transition-opacity duration-150",
                    collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
                    // tiny padding so the invisible rail doesn't cover text right at the edge
                    !collapsed ? "pl-1" : "",
                ].join(" ")}
            >
                <div className="flex-1 overflow-auto">{children}</div>
            </div>
        </div>
    );
}

/**
 * Simple horizontal resize (bottom-left/left-edge handle).
 * Returns width, limits, and a startResize handler.
 */
export function useResizableWidth({
    initial = 28 * 16,
    min = 18 * 16,
    max = 64 * 16,
} = {}) {
    const [width, setWidth] = useState(initial);

    const getX = (ev) =>
        ev?.touches && ev.touches[0] ? ev.touches[0].clientX : ev.clientX;

    const startResize = (e) => {
        e.preventDefault();
        const startX = getX(e);
        const startW = width;

        const move = (ev) => {
            const dx = startX - getX(ev);
            let next = startW + dx;
            if (next < min) next = min;
            if (next > max) next = max;
            setWidth(next);
        };

        const end = () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", end);
            window.removeEventListener("touchmove", move);
            window.removeEventListener("touchend", end);
            document.body.classList.remove("select-none");
        };

        document.body.classList.add("select-none");
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", end);
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", end);
    };

    return { width, startResize };
}

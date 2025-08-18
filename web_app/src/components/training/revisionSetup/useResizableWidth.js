import { useState } from "react";

/**
 * Simple horizontal resize (bottom-left/left-edge handle).
 * Returns width, limits, and a startResize handler.
 */
export function useResizableWidth({
    initial = 28 * 16, // 28rem
    min = 18 * 16,     // 18rem
    max = 64 * 16,     // 64rem 
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

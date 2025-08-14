import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../config/Firebase";
import { useAnswersRegistry } from "../../context/AnswersRegistry";

export default function Logout() {
    const { flushToResponses } = useAnswersRegistry();
    const [busy, setBusy] = useState(false);

    const handleLogOut = async () => {
        if (busy) return;
        setBusy(true);
        try {
            await flushToResponses();
        } catch (e) {
            console.error("Flush on logout failed:", e);
        } finally {
            try {
                await signOut(auth);
            } catch (e) {
                console.error("Logout failed:", e);
            } finally {
                setBusy(false);
            }
        }
    };

    return (
        <button className="btn" onClick={handleLogOut} disabled={busy}>
            {busy ? "Logging out…" : "Logout"}
        </button>
    );
}

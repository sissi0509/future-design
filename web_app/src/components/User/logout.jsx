import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../config/Firebase";
import { useAnswersRegistry } from "../../context/AnswersRegistry";
import { sendLogoutStatement } from '../../services/xapi/LogoutStatement';
import { logClientError } from '../../services/errorHandle/logClientError';

export default function Logout() {
    const { flushToResponses } = useAnswersRegistry();
    const [busy, setBusy] = useState(false);

    const user = auth.currentUser;


    const handleLogOut = async () => {
        if (busy) return;
        setBusy(true);
        alert('Without submission, your current session will not be saved.')
        try {
            await flushToResponses();
            await sendLogoutStatement(user);

        } catch (e) {
            logClientError({
                error: e,
                source: "Logout",
                reason: "Failed to flush answers or send logout statement"
            })
        } finally {
            try {
                await signOut(auth);
            } catch (e) {
                logClientError({
                    error: e,
                    source: "Logout",
                    reason: "Failed to logout."
                })
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

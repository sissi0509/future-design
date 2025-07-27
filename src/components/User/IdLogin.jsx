import { useState } from 'react';
import { auth } from '../../config/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { sendLoginStatement } from '../../services/xapi/LoginStatement';
import { logClientError } from '../../services/errorHandle/logClientError';

export default function IdLogin({ onClose }) {
    const [prolificId, setProlificId] = useState('');

    const handleChange = (e) => {
        setProlificId(e.target.value);
    };

    const handleLogin = async () => {
        const email = `${prolificId}@test.com`;
        const password = 'usedfortest';

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onClose();
        } catch (error) {
            alert("login failed, check your profilic ID");
            try {
                await logClientError({ error, source: "IdLogin", reason: `ID login with wrong ID ${prolificId} ` })
            } catch (logError) {
                console.error("Failed to log client error:", logError);
            };
            return;
        }

        try {
            await sendLoginStatement(email);
        } catch (error) {
            try {
                await logClientError(error, { source: "IdLogin", reason: "login xAPI send failed" })
            } catch (logError) {
                console.error("Failed to log client error:", logError);
            };;
        }
    };

    return (
        <div>
            <div>
                <label htmlFor="prolificId">Prolific ID</label>
                <input
                    className="input"
                    type="text"
                    id="prolificId"
                    name='prolificId'
                    placeholder="Prolific ID"
                    value={prolificId}
                    onChange={handleChange}
                />
            </div>

            <button className="btn" onClick={handleLogin}>
                Login
            </button>


            <button className="btn" onClick={onClose}>
                Cancel
            </button>
        </div >
    );
}

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

import { auth } from './config/Firebase';
import { useAuth } from './components/User/AuthSetUp';
import { logAutoFlush } from './services/errorHandle/logAutoFlash';
import { logClientError } from './services/errorHandle/logClientError';

import NewHome from './pages/NewHome';

function App() {
    const { currentUser } = useAuth();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const stopFlush = logAutoFlush();
        const unsubscribeAuthListener = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    await logClientError({
                        error,
                        source: 'App.jsx',
                        reason: 'Anonymous login failed in useEffect'
                    });
                }
            }
            setAuthChecked(true);
        });

        return () => {
            stopFlush()
            unsubscribeAuthListener();
        };
    }, []);

    return (
        <Router>
            <div>
                <main className="w-full">
                    {!authChecked || !currentUser ? (
                        <p>Loading...</p>
                    ) : (
                        <Routes>
                            <Route path="/" element={<NewHome />} />
                        </Routes>
                    )}
                </main>
            </div>
        </Router>
    );
}

export default App;

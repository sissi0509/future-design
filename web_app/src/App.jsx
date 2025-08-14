import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './config/Firebase';
import { logAutoFlush } from './services/errorHandle/logAutoFlash';

import Home from './pages/Home';

export default function App() {
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const stopFlush = logAutoFlush();

        const unsubscribe = onAuthStateChanged(auth, () => {
            setAuthChecked(true);
        });

        return () => {
            stopFlush();
            unsubscribe();
        };
    }, []);

    if (!authChecked) return <p>Loading...</p>;

    return (
        <Router>
            <main className="w-full">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </main>
        </Router>
    );
}

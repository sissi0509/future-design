import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { useEffect } from 'react';
import { logAutoFlush } from './services/errorHandle/logAutoFlash';
import { useAuth } from './components/User/AuthSetUp';

import Header from './components/Header';
import Consent from './pages/Consent';
import Home from './pages/Home';
import WelcomePage from './pages/WelcomePage';
import PreTest from './pages/PreTest';
import Training from './pages/Training';
import PostTest from './pages/PostTest';
import Survey from './pages/Survey';



function App() {
  const { currentUser } = useAuth();
  useEffect(() => {
    return logAutoFlush();
  }, []);

  return (
    <Router>
      <div>
        <Header />
        <main className="container">

          {currentUser ? (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/consent" element={<Consent />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/pre-test" element={<PreTest />} />
              <Route path="/training" element={<Training />} />
              <Route path="/post-test" element={<PostTest />} />
              <Route path="/survey" element={<Survey />} />
            </Routes>


          ) : (
            <p>Please log in to access the reviews.</p>
          )}
        </main>
      </div>
    </Router>

  );
}

export default App;
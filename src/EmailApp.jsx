import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { useEffect } from 'react';
import { logAutoFlush } from './services/errorHandle/logAutoFlash';
import { useAuth } from './components/User/AuthSetUp';

import Header from './components/Header';
import NewHome from './pages/NewHome';



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
              <Route path="/" element={<NewHome />} />
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
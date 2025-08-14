import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './components/User/AuthSetUp.jsx';
import { AnswersRegistryProvider } from './context/AnswersRegistry.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AnswersRegistryProvider>
        <App />
      </AnswersRegistryProvider>
    </AuthProvider>
  </StrictMode>,
);

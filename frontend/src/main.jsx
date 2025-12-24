import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// In Electron, if you plan to load the app from a file (production), 
// it's often safer to use HashRouter in App.jsx.
// For now, we will keep the rendering logic clean.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
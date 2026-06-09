import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppBoundary } from './components/AppBoundary.jsx';
import ShellContainer from './components/shell/ShellContainer.jsx';
import './styles.css';
import './render-preview.css';
import './desktop-render.css';
import './single-shell.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppBoundary>
      <ShellContainer>
        <App />
      </ShellContainer>
    </AppBoundary>
  </React.StrictMode>
);

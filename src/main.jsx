import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppBoundary } from './components/AppBoundary.jsx';
import './styles.css';
import './render-preview.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppBoundary>
      <App />
    </AppBoundary>
  </React.StrictMode>
);

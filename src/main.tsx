import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// limpar service workers antigos
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
    })
    .catch(() => {});
}

// limpar caches
if ('caches' in window) {
  caches
    .keys()
    .then((names) => {
      names.forEach((name) => caches.delete(name));
    })
    .catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './context/UserContext';
import { BrowserRouter } from 'react-router-dom'; // NEW IMPORT

// Ensure your styles (like Tailwind CSS) are imported here if needed
// import './index.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter> {/* NEW: Wrap your entire app */}
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
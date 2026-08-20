import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { GuardRailProvider } from './context/GuardRailContext.jsx';
import { BrowserRouter } from './router/index.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <GuardRailProvider>
                <App />
            </GuardRailProvider>
        </BrowserRouter>
    </React.StrictMode>
);

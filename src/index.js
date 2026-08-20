import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GuardRailProvider } from './context/GuardRailContext.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GuardRailProvider>
            <App />
        </GuardRailProvider>
    </React.StrictMode>
)
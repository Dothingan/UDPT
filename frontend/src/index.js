// frontend/src/index.js (hoặc main.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // File CSS toàn cục nhất của bạn
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom'; // << IMPORT ROUTER Ở ĐÂY

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Router> {/* << BỌC TOÀN BỘ APP BẰNG ROUTER Ở ĐÂY */}
            <AuthProvider> {/* AuthProvider có thể nằm trong hoặc ngoài Router tùy logic, nhưng App phải trong Router */}
                <App />
            </AuthProvider>
        </Router>
    </React.StrictMode>
);
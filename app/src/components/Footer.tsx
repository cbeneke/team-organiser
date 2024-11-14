import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Footer.css';

export const Footer: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide footer on login page
    if (location.pathname === '/login') {
        return null;
    }

    return (
        <footer className="mobile-footer">
            <div 
                className={`footer-item ${location.pathname === '/calendar' ? 'active' : ''}`}
                onClick={() => navigate('/calendar')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Kalender</span>
            </div>
            <div 
                className={`footer-item ${location.pathname === '/profile' ? 'active' : ''}`}
                onClick={() => navigate('/profile')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profil</span>
            </div>
        </footer>
    );
}; 
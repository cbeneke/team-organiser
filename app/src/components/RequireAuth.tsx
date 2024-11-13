import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

let lastValidationTime = 0;
const VALIDATION_INTERVAL = 30000; // 30 seconds in milliseconds

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isValidating, setIsValidating] = useState(true);

    const validateToken = async (token: string) => {
        try {
            const now = Date.now();
            // Skip validation if less than 30 seconds have passed
            if (now - lastValidationTime < VALIDATION_INTERVAL) {
                setIsValidating(false);
                return true;
            }

            const response = await fetch('http://localhost:8000/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Token invalid');
            }

            lastValidationTime = now;
            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('access_token');
            navigate('/login', { state: { from: location }, replace: true });
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setIsValidating(false);
            return;
        }

        validateToken(token);
    }, [location.pathname]); // Re-validate when route changes

    const token = localStorage.getItem('access_token');

    if (isValidating) {
        // Optional: You could show a loading spinner here
        return null;
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
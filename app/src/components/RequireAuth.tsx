import React from "react";
import { Navigate } from "react-router-dom";

export const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
        return <Navigate to="/login" />;
    }

    return children;
};
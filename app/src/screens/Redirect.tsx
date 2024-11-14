import React from "react";
import { Navigate } from "react-router";

export const Redirect: React.FC = () => {
    const accessToken = localStorage.getItem('access_token');
    
    if (accessToken) {
        return <Navigate to="/calendar" />
    } else {
        return <Navigate to="/login" />;
    }
}
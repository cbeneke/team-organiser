import React from "react";
import { Navigate } from "react-router";

export const Logout:React.FC = ()=>{
    localStorage.removeItem('access_token');
    return <Navigate to="/" />
}
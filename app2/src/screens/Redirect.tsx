import React from "react";
import { Navigate } from "react-router";

export const Redirect:React.FC = ()=>{
    return <Navigate to="/login" />
}
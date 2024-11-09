import React from "react";
import { Outlet } from "react-router";

export const Layout:React.FC = ()=>{
    return <div><Outlet /></div>
}
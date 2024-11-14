import React from "react";
import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer";
import "./Layout.css";

export const Layout: React.FC = () => {
    return (
        <div className="layout">
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
// src/components/Layout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import '../Layout.css';

const Layout = () => {
    return (
        <div className="layout">
            <header className="header">
                <h1>Mi Dashboard</h1>
                <nav className="nav">
                    <Link to="/">Dashboard</Link>
                    <Link to="/profile">Perfil</Link>
                    <Link to="/settings">Configuración</Link>
                </nav>
            </header>
            <div className="content">
                <aside className="sidebar">
                    <ul>
                        <li><Link to="/">Dashboard</Link></li>
                        <li><Link to="/profile">Perfil</Link></li>
                        <li><Link to="/settings">Configuración</Link></li>
                    </ul>
                </aside>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
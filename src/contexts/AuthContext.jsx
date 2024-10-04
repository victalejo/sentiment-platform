// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Importación corregida
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: null,
        user: null,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setAuth({
                token,
                user: {
                    username: decoded.username,
                    roles: decoded.roles,
                },
            });
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    const login = (token) => {
        const decoded = jwtDecode(token);
        setAuth({
            token,
            user: {
                username: decoded.username,
                roles: decoded.roles,
            },
        });
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = () => {
        setAuth({
            token: null,
            user: null,
        });
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
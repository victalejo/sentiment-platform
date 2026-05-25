// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Importación corregida
import api from '../services/api';

export const AuthContext = createContext();

const normalizeRoles = (roles = []) => (
    roles
        .map((role) => (typeof role === 'string' ? role : role.name))
        .filter(Boolean)
);

const buildUser = (token, userData = null) => {
    const decoded = jwtDecode(token);
    return {
        username: userData?.username || decoded.username || decoded.sub,
        roles: normalizeRoles(userData?.roles || decoded.roles || []),
    };
};

const getStoredAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return {
            token: null,
            user: null,
        };
    }

    try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return {
            token,
            user: buildUser(token, storedUser),
        };
    } catch (err) {
        console.error('Token almacenado inválido', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return {
            token: null,
            user: null,
        };
    }
};

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(getStoredAuth);

    useEffect(() => {
        if (auth.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
            return;
        }
        delete api.defaults.headers.common['Authorization'];
    }, [auth.token]);

    const login = (token, userData) => {
        const user = buildUser(token, userData);
        setAuth({
            token,
            user,
        });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = () => {
        setAuth({
            token: null,
            user: null,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// src/components/common/PrivateRoute.jsx

import React, { useContext } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Layout from '../Layout/Layout';
import Dashboard from '../../pages/Dashboard';
import Users from '../../pages/Users';
import Sentiments from '../../pages/Sentiments';
import Chats from '../../pages/Chats';
import Agents from '../../pages/Agents';
import History from '../../pages/History';

const PrivateRoute = ({ children }) => {
    const { auth } = useContext(AuthContext);

    if (!auth.token) {
        return <Navigate to="/login" />;
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/sentiments" element={<Sentiments />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/history" element={<History />} />
            </Routes>
        </Layout>
    );
};

export default PrivateRoute;
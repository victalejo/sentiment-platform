import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from '../../pages/Dashboard';
import Users from '../../pages/Users';
import Sentiments from '../../pages/Sentiments';
import Chats from '../../pages/Chats';
import Agents from '../../pages/Agents';
import AnalysisHistory from '../../pages/AnalysisHistory';
import NotFound from '../../pages/NotFound';

const AppShell = () => (
    <Layout>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/sentiments" element={<Sentiments />} />
            <Route path="/historial" element={<AnalysisHistory />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </Layout>
);

export default AppShell;

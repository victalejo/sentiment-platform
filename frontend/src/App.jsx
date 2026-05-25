// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Sentiments from './pages/Sentiments';
import Chats from './pages/Chats';
import Agents from './pages/Agents';
import NotFound from './pages/NotFound';

function App() {
    const protectedPage = (page) => (
        <PrivateRoute>
            <Layout>
                {page}
            </Layout>
        </PrivateRoute>
    );

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={protectedPage(<Dashboard />)} />
                    <Route path="/users" element={protectedPage(<Users />)} />
                    <Route path="/sentiments" element={protectedPage(<Sentiments />)} />
                    <Route path="/chats" element={protectedPage(<Chats />)} />
                    <Route path="/agents" element={protectedPage(<Agents />)} />
                    <Route path="*" element={protectedPage(<NotFound />)} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

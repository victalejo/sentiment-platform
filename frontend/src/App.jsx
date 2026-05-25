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
import History from './pages/History';
import Chats from './pages/Chats';
import Agents from './pages/Agents';
import NotFound from './pages/NotFound';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Users />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/sentiments"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Sentiments />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <History />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/chats"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Chats />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agents"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Agents />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

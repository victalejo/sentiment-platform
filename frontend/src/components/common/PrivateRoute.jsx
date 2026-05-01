// src/components/common/PrivateRoute.jsx

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { auth } = useContext(AuthContext);

    if (!auth.token) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;

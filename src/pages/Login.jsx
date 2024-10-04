// src/pages/Login.jsx

import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Alert,
} from '@mui/material';
import api from '../services/api';

const Login = () => {
    const { auth, login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');

    if (auth.token) {
        return <Navigate to="/" />;
    }

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Convertir los datos del formulario a URLSearchParams
            const params = new URLSearchParams();
            params.append('username', formData.username);
            params.append('password', formData.password);

            const response = await api.post('/auth/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            login(response.data.access_token);
        } catch (err) {
            console.error('Error en login:', err);
            setError('Credenciales inválidas. Inténtalo de nuevo.');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Iniciar Sesión
                </Typography>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Usuario"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Iniciar Sesión
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;

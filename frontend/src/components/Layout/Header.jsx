// src/components/Layout/Header.jsx

import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../../contexts/AuthContext';

const Header = () => {
    const { auth, logout } = useContext(AuthContext);

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    Plataforma de Análisis de Sentimiento
                </Typography>
                {auth?.user?.username && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2">{auth.user.username}</Typography>
                        <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
                            Salir
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;

// src/components/Layout/Header.jsx

import React, { useContext } from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../../contexts/AuthContext';

const Header = () => {
    const { auth, logout } = useContext(AuthContext);

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Sentiment Platform
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                {auth.user && (
                    <Typography variant="body2" sx={{ mr: 2 }}>
                        {auth.user.username}
                    </Typography>
                )}
                <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
                    Salir
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Header;

import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';

const Header = () => {
    const { auth, logout } = useContext(AuthContext);

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Sentiment Platform
                </Typography>
                {auth.user && (
                    <>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            {auth.user.username}
                        </Typography>
                        <Button color="inherit" onClick={logout}>
                            Salir
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;

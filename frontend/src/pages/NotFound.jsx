// src/pages/NotFound.jsx

import React from 'react';
import { Typography, Container } from '@mui/material';

const NotFound = () => {
    return (
        <Container>
            <Typography variant="h3" align="center" gutterBottom>
                404 - Página No Encontrada
            </Typography>
            <Typography variant="h6" align="center">
                La página que estás buscando no existe.
            </Typography>
        </Container>
    );
};

export default NotFound;

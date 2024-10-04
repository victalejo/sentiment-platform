// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { Box } from '@mui/system';
import SentimentChart from '../components/charts/SentimentChart';
import api from '../services/api';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get('/sentimientos/resumen');
                setSummary(response.data);
            } catch (err) {
                console.error('Error al obtener resumen de sentimientos', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Resumen de Sentimientos
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Total de Mensajes</Typography>
                        <Typography variant="h4">{summary.total_messages}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Muy Positivo</Typography>
                        <Typography variant="h4">{summary.very_positive}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Positivo</Typography>
                        <Typography variant="h4">{summary.positive}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Neutral</Typography>
                        <Typography variant="h4">{summary.neutral}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Negativo</Typography>
                        <Typography variant="h4">{summary.negative}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Muy Negativo</Typography>
                        <Typography variant="h4">{summary.very_negative}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mt: 5 }}>
                <Typography variant="h5" gutterBottom>
                    Distribución de Sentimientos
                </Typography>
                <SentimentChart data={summary} />
            </Box>
        </Box>
    );
};

export default Dashboard;

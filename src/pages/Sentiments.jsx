// src/pages/Sentiments.jsx

import React, { useEffect, useState } from 'react';
import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    TextField,
    Grid,
    MenuItem,
    Button,
} from '@mui/material';
import api from '../services/api';

const Sentiments = () => {
    const [sentiments, setSentiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        agent_name: '',
        customer_name: '',
        channel: '',
        de: '',
        date_from: '',
        date_to: '',
        sentiment: '',
    });

    useEffect(() => {
        const fetchSentiments = async () => {
            setLoading(true);
            try {
                const params = { ...filters };
                // Eliminar parámetros vacíos
                Object.keys(params).forEach(key => {
                    if (!params[key]) {
                        delete params[key];
                    }
                });
                const response = await api.get('/sentimientos/', { params });
                setSentiments(response.data);
            } catch (err) {
                console.error('Error al obtener sentimientos', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSentiments();
    }, [filters]);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setFilters({
            agent_name: '',
            customer_name: '',
            channel: '',
            de: '',
            date_from: '',
            date_to: '',
            sentiment: '',
        });
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Análisis de Sentimientos
            </Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Nombre del Agente"
                            name="agent_name"
                            value={filters.agent_name}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Nombre del Cliente"
                            name="customer_name"
                            value={filters.customer_name}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Canal"
                            name="channel"
                            value={filters.channel}
                            onChange={handleChange}
                            select
                            fullWidth
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="chat">Chat</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                            {/* Agrega más canales según sea necesario */}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="De"
                            name="de"
                            value={filters.de}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Fecha Desde"
                            name="date_from"
                            type="date"
                            value={filters.date_from}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Fecha Hasta"
                            name="date_to"
                            type="date"
                            value={filters.date_to}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Sentimiento"
                            name="sentiment"
                            value={filters.sentiment}
                            onChange={handleChange}
                            select
                            fullWidth
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="muy positivo">Muy Positivo</MenuItem>
                            <MenuItem value="positivo">Positivo</MenuItem>
                            <MenuItem value="neutral">Neutral</MenuItem>
                            <MenuItem value="negativo">Negativo</MenuItem>
                            <MenuItem value="muy negativo">Muy Negativo</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button variant="contained" color="primary" onClick={() => {}}>
                            Filtrar
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={handleReset} sx={{ ml: 2 }}>
                            Reiniciar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            <TableContainer component={Paper}>
                <Table aria-label="tabla de sentimientos">
                    <TableHead>
                        <TableRow>
                            <TableCell>Conn ID</TableCell>
                            <TableCell>Agente</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Canal</TableCell>
                            <TableCell>De</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Mensaje</TableCell>
                            <TableCell>Sentimiento</TableCell>
                            <TableCell>Puntuación</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sentiments.map((sentiment, index) => (
                            <TableRow key={index}>
                                <TableCell>{sentiment.conn_id}</TableCell>
                                <TableCell>{sentiment.agent_name}</TableCell>
                                <TableCell>{sentiment.customer_name}</TableCell>
                                <TableCell>{sentiment.channel}</TableCell>
                                <TableCell>{sentiment.de}</TableCell>
                                <TableCell>{new Date(sentiment.date).toLocaleString()}</TableCell>
                                <TableCell>{sentiment.message}</TableCell>
                                <TableCell>{sentiment.sentiment}</TableCell>
                                <TableCell>{sentiment.sentiment_score}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Sentiments;

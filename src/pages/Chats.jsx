// src/pages/Chats.jsx

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
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../services/api';

const Chats = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        agent_name: '',
        customer_name: '',
        channel: '',
        de: '',
        date_from: '',
        date_to: '',
    });

    useEffect(() => {
        const fetchChats = async () => {
            setLoading(true);
            try {
                const params = { ...filters };
                // Eliminar parámetros vacíos
                Object.keys(params).forEach(key => {
                    if (!params[key]) {
                        delete params[key];
                    }
                });
                const response = await api.get('/chats/', { params });
                setChats(response.data);
            } catch (err) {
                console.error('Error al obtener chats', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
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
        });
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Análisis de Chats
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
                <Table aria-label="tabla de chats">
                    <TableHead>
                        <TableRow>
                            <TableCell>Conn ID</TableCell>
                            <TableCell>Agente</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Canal</TableCell>
                            <TableCell>De</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Sentimiento</TableCell>
                            <TableCell>Puntuación Promedio</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chats.map((chat, index) => (
                            <TableRow key={index}>
                                <TableCell>{chat.conn_id}</TableCell>
                                <TableCell>{chat.agent_name}</TableCell>
                                <TableCell>{chat.customer_name}</TableCell>
                                <TableCell>{chat.channel}</TableCell>
                                <TableCell>{chat.de}</TableCell>
                                <TableCell>{new Date(chat.date).toLocaleString()}</TableCell>
                                <TableCell>{chat.sentiment}</TableCell>
                                <TableCell>{chat.average_sentiment_score}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Opcional: Implementar detalles de chat con Accordion */}
            <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
                Detalles de Chats
            </Typography>
            {chats.map((chat, index) => (
                <Accordion key={index}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel${index}-content`}
                        id={`panel${index}-header`}
                    >
                        <Typography>Conn ID: {chat.conn_id} - Sentimiento: {chat.sentiment}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="subtitle1">Mensajes:</Typography>
                        <Table size="small" aria-label="mensajes">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>De</TableCell>
                                    <TableCell>Para</TableCell>
                                    <TableCell>Canal</TableCell>
                                    <TableCell>Mensaje</TableCell>
                                    <TableCell>Sentimiento</TableCell>
                                    <TableCell>Puntuación</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {chat.messages.map((msg, msgIndex) => (
                                    <TableRow key={msgIndex}>
                                        <TableCell>{new Date(msg.date).toLocaleString()}</TableCell>
                                        <TableCell>{msg.from_name}</TableCell>
                                        <TableCell>{msg.to_name}</TableCell>
                                        <TableCell>{msg.channel}</TableCell>
                                        <TableCell>{msg.message}</TableCell>
                                        <TableCell>{msg.sentiment}</TableCell>
                                        <TableCell>{msg.sentiment_score}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

export default Chats;

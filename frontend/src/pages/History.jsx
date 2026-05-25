// src/pages/History.jsx
//
// Historial persistente de análisis de sentimiento:
// permite analizar un texto nuevo, listar análisis anteriores, ver el detalle
// y borrarlos. Maneja estados de loading, error y empty.

import React, { useCallback, useEffect, useState } from 'react';
import {
    Typography,
    Paper,
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../services/api';

// Color del chip según el sentimiento devuelto por el backend.
const sentimentColor = (sentiment) => {
    switch ((sentiment || '').toLowerCase()) {
        case 'muy positivo':
            return 'success';
        case 'positivo':
            return 'info';
        case 'negativo':
            return 'warning';
        case 'muy negativo':
            return 'error';
        default:
            return 'default';
    }
};

const History = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [texto, setTexto] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState('');

    const [selected, setSelected] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchHistorial = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/sentimientos/historial');
            setItems(response.data);
        } catch (err) {
            console.error('Error al obtener el historial', err);
            setError('No se pudo cargar el historial. Verifica tu sesión y el servidor.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistorial();
    }, [fetchHistorial]);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setAnalyzeError('');
        const value = texto.trim();
        if (!value) {
            setAnalyzeError('Escribe un texto para analizar.');
            return;
        }
        setAnalyzing(true);
        try {
            const response = await api.post('/sentimientos/analizar', { texto: value });
            setItems((prev) => [response.data, ...prev]);
            setTexto('');
        } catch (err) {
            console.error('Error al analizar el texto', err);
            setAnalyzeError(
                err?.response?.data?.detail
                    ? String(err.response.data.detail)
                    : 'No se pudo analizar el texto. Intenta de nuevo.'
            );
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await api.delete(`/sentimientos/historial/${id}`);
            setItems((prev) => prev.filter((it) => it.id !== id));
            if (selected?.id === id) {
                setSelected(null);
            }
        } catch (err) {
            console.error('Error al borrar el análisis', err);
            setError('No se pudo borrar el análisis. Intenta de nuevo.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Historial de Análisis
            </Typography>

            {/* Formulario para analizar un texto nuevo */}
            <Paper sx={{ p: 2, mb: 3 }} component="form" onSubmit={handleAnalyze}>
                <Typography variant="h6" gutterBottom>
                    Analizar un texto
                </Typography>
                {analyzeError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {analyzeError}
                    </Alert>
                )}
                <TextField
                    label="Texto a analizar"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    inputProps={{ maxLength: 5000 }}
                    sx={{ mb: 2 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={analyzing || !texto.trim()}
                >
                    {analyzing ? 'Analizando…' : 'Analizar y guardar'}
                </Button>
            </Paper>

            {/* Listado del historial */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : items.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Aún no hay análisis guardados. Analiza un texto para empezar.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table aria-label="historial de análisis">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Texto</TableCell>
                                <TableCell>Sentimiento</TableCell>
                                <TableCell align="right">Score</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell sx={{ maxWidth: 360 }}>
                                        <Typography noWrap title={item.texto}>
                                            {item.texto}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.sentiment}
                                            color={sentimentColor(item.sentiment)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {Number(item.sentiment_score).toFixed(4)}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(item.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Ver detalle">
                                            <IconButton
                                                size="small"
                                                aria-label={`ver análisis ${item.id}`}
                                                onClick={() => setSelected(item)}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Borrar">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    aria-label={`borrar análisis ${item.id}`}
                                                    disabled={deletingId === item.id}
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Detalle de un análisis */}
            <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
                <DialogTitle>Análisis #{selected?.id}</DialogTitle>
                <DialogContent dividers>
                    <DialogContentText component="div">
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2">Texto</Typography>
                            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selected?.texto}</Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" component="span">Sentimiento: </Typography>
                            {selected && (
                                <Chip
                                    label={selected.sentiment}
                                    color={sentimentColor(selected.sentiment)}
                                    size="small"
                                />
                            )}
                        </Box>
                        <Typography variant="body2">
                            Score: {selected ? Number(selected.sentiment_score).toFixed(4) : ''}
                        </Typography>
                        <Typography variant="body2">
                            Creado por: {selected?.created_by || '—'}
                        </Typography>
                        <Typography variant="body2">
                            Fecha: {selected ? new Date(selected.created_at).toLocaleString() : ''}
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelected(null)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default History;

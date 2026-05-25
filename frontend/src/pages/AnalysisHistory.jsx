import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../services/api';

const AnalysisHistory = () => {
    const [history, setHistory] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/historial/');
            setHistory(response.data);
        } catch (err) {
            const message = err.response?.data?.detail || 'No se pudo cargar el historial';
            setError(typeof message === 'string' ? message : 'Error al cargar el historial');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) {
            setError('Escribe un texto para analizar');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await api.post('/historial/', { text: trimmed });
            setText('');
            await fetchHistory();
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map((d) => d.msg).join(', '));
            } else {
                setError(detail || 'No se pudo analizar el texto');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleView = async (id) => {
        setError(null);
        try {
            const response = await api.get(`/historial/${id}`);
            setSelected(response.data);
            setDetailOpen(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'No se pudo cargar el análisis');
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        setError(null);
        try {
            await api.delete(`/historial/${id}`);
            if (selected?.id === id) {
                setDetailOpen(false);
                setSelected(null);
            }
            await fetchHistory();
        } catch (err) {
            setError(err.response?.data?.detail || 'No se pudo eliminar el análisis');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (value) => new Date(value).toLocaleString();

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Historial de análisis
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Analiza texto libre y consulta resultados guardados. El flujo de conversaciones en Sentimientos no cambia.
            </Typography>

            <Paper component="form" onSubmit={handleAnalyze} sx={{ p: 2, mb: 3 }}>
                <TextField
                    label="Texto a analizar"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    disabled={submitting}
                    inputProps={{ maxLength: 10000 }}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={submitting}>
                        {submitting ? 'Analizando…' : 'Analizar y guardar'}
                    </Button>
                    {submitting && <CircularProgress size={24} />}
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress aria-label="Cargando historial" />
                </Box>
            ) : history.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Sin análisis guardados
                    </Typography>
                    <Typography color="text.secondary">
                        Realiza tu primer análisis con el formulario de arriba.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table aria-label="historial de análisis">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Texto</TableCell>
                                <TableCell>Sentimiento</TableCell>
                                <TableCell>Score</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{formatDate(item.created_at)}</TableCell>
                                    <TableCell sx={{ maxWidth: 320 }}>
                                        {item.text.length > 80 ? `${item.text.slice(0, 80)}…` : item.text}
                                    </TableCell>
                                    <TableCell>{item.sentiment}</TableCell>
                                    <TableCell>{item.sentiment_score.toFixed(3)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            aria-label={`Ver análisis ${item.id}`}
                                            onClick={() => handleView(item.id)}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton
                                            aria-label={`Eliminar análisis ${item.id}`}
                                            color="error"
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingId === item.id}
                                        >
                                            {deletingId === item.id ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                <DeleteIcon />
                                            )}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Detalle del análisis #{selected?.id}</DialogTitle>
                <DialogContent dividers>
                    {selected && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                                {formatDate(selected.created_at)}
                            </Typography>
                            <Typography variant="subtitle2">Texto</Typography>
                            <Typography variant="body1">{selected.text}</Typography>
                            <Typography variant="subtitle2">Sentimiento</Typography>
                            <Typography variant="body1">{selected.sentiment}</Typography>
                            <Typography variant="subtitle2">Score (confianza VADER)</Typography>
                            <Typography variant="body1">{selected.sentiment_score.toFixed(4)}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {selected && (
                        <Button
                            color="error"
                            onClick={() => handleDelete(selected.id)}
                            disabled={deletingId === selected.id}
                        >
                            Eliminar
                        </Button>
                    )}
                    <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AnalysisHistory;

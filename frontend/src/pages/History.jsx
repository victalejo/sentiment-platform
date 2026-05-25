// src/pages/History.jsx

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
    Box,
    IconButton,
    Chip,
    TextField,
    MenuItem,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../services/api';

const getSentimentColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
        case 'muy positivo':
            return 'success';
        case 'positivo':
            return 'success';
        case 'neutral':
            return 'default';
        case 'negativo':
            return 'error';
        case 'muy negativo':
            return 'error';
        default:
            return 'default';
    }
};

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0 });
    const [sentimentFilter, setSentimentFilter] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page: pagination.page, page_size: pagination.page_size };
            if (sentimentFilter) {
                params.sentiment = sentimentFilter;
            }
            const response = await api.get('/historial/', { params });
            setHistory(response.data.items);
            setPagination({
                page: response.data.page,
                page_size: response.data.page_size,
                total: response.data.total,
            });
        } catch (err) {
            setError('Error al cargar el historial de análisis');
            console.error('Error al obtener historial', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [pagination.page, sentimentFilter]);

    const handlePageChange = (newPage) => {
        setPagination({ ...pagination, page: newPage });
    };

    const handleFilterChange = (e) => {
        setSentimentFilter(e.target.value);
        setPagination({ ...pagination, page: 1 });
    };

    const handleViewDetail = (item) => {
        setSelectedItem(item);
        setDetailOpen(true);
    };

    const handleDeleteConfirm = (item) => {
        setItemToDelete(item);
        setDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/historial/${itemToDelete.id}`);
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
            fetchHistory();
        } catch (err) {
            setError('Error al eliminar el análisis');
            console.error('Error al eliminar', err);
        }
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedItem(null);
    };

    if (loading && history.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const totalPages = Math.ceil(pagination.total / pagination.page_size);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Historial de Análisis de Sentimiento
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="Filtrar por sentimiento"
                        name="sentiment"
                        value={sentimentFilter}
                        onChange={handleFilterChange}
                        select
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="muy positivo">Muy Positivo</MenuItem>
                        <MenuItem value="positivo">Positivo</MenuItem>
                        <MenuItem value="neutral">Neutral</MenuItem>
                        <MenuItem value="negativo">Negativo</MenuItem>
                        <MenuItem value="muy negativo">Muy Negativo</MenuItem>
                    </TextField>
                    <Typography variant="body2" color="text.secondary">
                        Total: {pagination.total} análisis
                    </Typography>
                </Box>
            </Paper>

            {history.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No hay análisis guardados en el historial
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Los análisis de sentimiento aparecerán aquí cuando se guarden
                    </Typography>
                </Paper>
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table aria-label="tabla de historial">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Texto</TableCell>
                                    <TableCell>Sentimiento</TableCell>
                                    <TableCell>Score</TableCell>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell sx={{ maxWidth: 300 }}>
                                            <Typography
                                                variant="body2"
                                                noWrap
                                                title={item.text}
                                            >
                                                {item.text.length > 100
                                                    ? item.text.substring(0, 100) + '...'
                                                    : item.text}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.sentiment}
                                                color={getSentimentColor(item.sentiment)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{item.sentiment_score.toFixed(4)}</TableCell>
                                        <TableCell>
                                            {new Date(item.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleViewDetail(item)}
                                                size="small"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteConfirm(item)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            disabled={pagination.page === 1}
                            onClick={() => handlePageChange(pagination.page - 1)}
                        >
                            Anterior
                        </Button>
                        <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                            Página {pagination.page} de {totalPages}
                        </Typography>
                        <Button
                            disabled={pagination.page >= totalPages}
                            onClick={() => handlePageChange(pagination.page + 1)}
                        >
                            Siguiente
                        </Button>
                    </Box>
                </>
            )}

            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
                <DialogTitle>Detalle del Análisis</DialogTitle>
                <DialogContent>
                    {selectedItem && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Texto analizado:
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="body2">{selectedItem.text}</Typography>
                            </Paper>

                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2">Sentimiento:</Typography>
                                    <Chip
                                        label={selectedItem.sentiment}
                                        color={getSentimentColor(selectedItem.sentiment)}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">
                                        Score: {selectedItem.sentiment_score.toFixed(4)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">
                                        Fecha: {new Date(selectedItem.created_at).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetail}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar este análisis? Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default History;
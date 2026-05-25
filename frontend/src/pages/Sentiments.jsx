// src/pages/Sentiments.jsx

import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InsightsIcon from '@mui/icons-material/Insights';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../services/api';

const sentimentOptions = [
    { value: 'muy positivo', label: 'Muy Positivo' },
    { value: 'positivo', label: 'Positivo' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negativo', label: 'Negativo' },
    { value: 'muy negativo', label: 'Muy Negativo' },
];

const getApiErrorMessage = (err, fallback) => {
    const detail = err.response?.data?.detail;
    if (Array.isArray(detail)) {
        return detail.map((item) => item.msg).join(' ');
    }
    if (typeof detail === 'string') {
        return detail;
    }
    return fallback;
};

const formatDate = (value) => {
    if (!value) {
        return '-';
    }
    return new Date(value).toLocaleString();
};

const formatScore = (value) => {
    if (typeof value !== 'number') {
        return '-';
    }
    return value.toFixed(3);
};

const Sentiments = () => {
    const [sentiments, setSentiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sentimentsError, setSentimentsError] = useState('');
    const [filters, setFilters] = useState({
        agent_name: '',
        customer_name: '',
        channel: '',
        de: '',
        date_from: '',
        date_to: '',
        sentiment: '',
    });
    const [analysisText, setAnalysisText] = useState('');
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState('');
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        setHistoryError('');
        try {
            const response = await api.get('/sentimientos/historial');
            setHistory(response.data);
        } catch (err) {
            setHistoryError(getApiErrorMessage(err, 'No se pudo cargar el historial.'));
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchSentiments = async () => {
            setLoading(true);
            setSentimentsError('');
            try {
                const params = { ...filters };
                Object.keys(params).forEach((key) => {
                    if (!params[key]) {
                        delete params[key];
                    }
                });
                const response = await api.get('/sentimientos/', { params });
                setSentiments(response.data);
            } catch (err) {
                setSentimentsError(getApiErrorMessage(err, 'No se pudieron cargar los sentimientos.'));
            } finally {
                setLoading(false);
            }
        };

        fetchSentiments();
    }, [filters]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

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

    const handleAnalyze = async (event) => {
        event.preventDefault();
        setAnalysisError('');
        setAnalysisResult(null);

        if (!analysisText.trim()) {
            setAnalysisError('Ingresa un texto para analizar.');
            return;
        }

        setAnalysisLoading(true);
        try {
            const response = await api.post('/sentimientos/analizar', {
                text: analysisText,
            });
            setAnalysisResult(response.data);
            setAnalysisText('');
            await fetchHistory();
        } catch (err) {
            setAnalysisError(getApiErrorMessage(err, 'No se pudo analizar el texto.'));
        } finally {
            setAnalysisLoading(false);
        }
    };

    const handleSelectAnalysis = async (analysisId) => {
        setHistoryError('');
        try {
            const response = await api.get(`/sentimientos/historial/${analysisId}`);
            setSelectedAnalysis(response.data);
        } catch (err) {
            setHistoryError(getApiErrorMessage(err, 'No se pudo cargar el analisis.'));
        }
    };

    const handleDeleteAnalysis = async (analysisId) => {
        setDeletingId(analysisId);
        setHistoryError('');
        try {
            await api.delete(`/sentimientos/historial/${analysisId}`);
            setHistory((currentHistory) => currentHistory.filter((item) => item.id !== analysisId));
            if (selectedAnalysis?.id === analysisId) {
                setSelectedAnalysis(null);
            }
        } catch (err) {
            setHistoryError(getApiErrorMessage(err, 'No se pudo borrar el analisis.'));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Análisis de Sentimientos
            </Typography>

            <Paper component="form" onSubmit={handleAnalyze} sx={{ p: 2, mb: 3 }}>
                <Stack spacing={2}>
                    <TextField
                        label="Texto para analizar"
                        value={analysisText}
                        onChange={(event) => setAnalysisText(event.target.value)}
                        multiline
                        minRows={3}
                        inputProps={{ maxLength: 5000 }}
                        fullWidth
                    />
                    {analysisError && <Alert severity="error">{analysisError}</Alert>}
                    {analysisResult && (
                        <Alert severity="success">
                            Resultado: {analysisResult.sentiment} · Score {formatScore(analysisResult.sentiment_score)}
                        </Alert>
                    )}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={analysisLoading ? <CircularProgress size={18} /> : <InsightsIcon />}
                            disabled={analysisLoading}
                        >
                            Analizar
                        </Button>
                        <Button
                            type="button"
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchHistory}
                            disabled={historyLoading}
                        >
                            Actualizar historial
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Historial
                </Typography>
                {historyLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}
                {!historyLoading && historyError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {historyError}
                    </Alert>
                )}
                {!historyLoading && !historyError && history.length === 0 && (
                    <Paper sx={{ p: 3 }}>
                        <Typography color="text.secondary">No hay analisis guardados.</Typography>
                    </Paper>
                )}
                {!historyLoading && history.length > 0 && (
                    <TableContainer component={Paper}>
                        <Table aria-label="historial de analisis">
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
                                    <TableRow key={item.id} hover>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{formatDate(item.created_at)}</TableCell>
                                        <TableCell sx={{ maxWidth: 420 }}>
                                            <Typography variant="body2" noWrap title={item.text}>
                                                {item.text}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={item.sentiment} size="small" />
                                        </TableCell>
                                        <TableCell>{formatScore(item.sentiment_score)}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Ver detalle">
                                                <IconButton
                                                    aria-label={`Ver analisis ${item.id}`}
                                                    onClick={() => handleSelectAnalysis(item.id)}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Borrar">
                                                <span>
                                                    <IconButton
                                                        aria-label={`Borrar analisis ${item.id}`}
                                                        color="error"
                                                        onClick={() => handleDeleteAnalysis(item.id)}
                                                        disabled={deletingId === item.id}
                                                    >
                                                        {deletingId === item.id ? (
                                                            <CircularProgress size={20} />
                                                        ) : (
                                                            <DeleteIcon />
                                                        )}
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
            </Box>

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
                            {sentimentOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button variant="outlined" color="secondary" onClick={handleReset}>
                            Reiniciar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h5" gutterBottom>
                Mensajes existentes
            </Typography>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && sentimentsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {sentimentsError}
                </Alert>
            )}
            {!loading && !sentimentsError && sentiments.length === 0 && (
                <Paper sx={{ p: 3 }}>
                    <Typography color="text.secondary">No se encontraron mensajes con los filtros actuales.</Typography>
                </Paper>
            )}
            {!loading && !sentimentsError && sentiments.length > 0 && (
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
                                <TableRow key={`${sentiment.conn_id}-${index}`}>
                                    <TableCell>{sentiment.conn_id}</TableCell>
                                    <TableCell>{sentiment.agent_name}</TableCell>
                                    <TableCell>{sentiment.customer_name}</TableCell>
                                    <TableCell>{sentiment.channel}</TableCell>
                                    <TableCell>{sentiment.de}</TableCell>
                                    <TableCell>{formatDate(sentiment.date)}</TableCell>
                                    <TableCell sx={{ maxWidth: 420 }}>
                                        <Typography variant="body2" noWrap title={sentiment.message}>
                                            {sentiment.message}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{sentiment.sentiment}</TableCell>
                                    <TableCell>{formatScore(sentiment.sentiment_score)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={Boolean(selectedAnalysis)}
                onClose={() => setSelectedAnalysis(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Detalle del análisis</DialogTitle>
                <DialogContent dividers>
                    {selectedAnalysis && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                {formatDate(selectedAnalysis.created_at)}
                            </Typography>
                            <Typography>{selectedAnalysis.text}</Typography>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                <Chip label={selectedAnalysis.sentiment} />
                                <Chip label={`Score ${formatScore(selectedAnalysis.sentiment_score)}`} variant="outlined" />
                            </Stack>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedAnalysis(null)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Sentiments;

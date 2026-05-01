// src/pages/Users.jsx

import React, { useEffect, useState, useContext } from 'react';
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
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null });

    const { auth } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
            } catch (err) {
                console.error('Error al obtener usuarios', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = (userId) => {
        setDeleteDialog({ open: true, userId });
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/users/${deleteDialog.userId}`);
            setUsers(users.filter(user => user.id !== deleteDialog.userId));
        } catch (err) {
            console.error('Error al eliminar usuario', err);
        } finally {
            setDeleteDialog({ open: false, userId: null });
        }
    };

    const cancelDelete = () => {
        setDeleteDialog({ open: false, userId: null });
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Gestión de Usuarios
            </Typography>
            <TableContainer component={Paper}>
                <Table aria-label="tabla de usuarios">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Activo</TableCell>
                            <TableCell>Roles</TableCell>
                            {auth.user.roles.includes('admin') && <TableCell>Acciones</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.is_active ? 'Sí' : 'No'}</TableCell>
                                <TableCell>{user.roles.map(role => role.name).join(', ')}</TableCell>
                                {auth.user.roles.includes('admin') && (
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Diálogo de Confirmación para Eliminar Usuario */}
            <Dialog
                open={deleteDialog.open}
                onClose={cancelDelete}
            >
                <DialogTitle>Eliminar Usuario</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete}>Cancelar</Button>
                    <Button onClick={confirmDelete} color="secondary">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Users;

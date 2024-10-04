// src/services/api.js

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Puedes agregar interceptores si es necesario
// Por ejemplo, para manejar errores globales

export default api;

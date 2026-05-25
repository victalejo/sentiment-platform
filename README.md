# Sentiment Platform

Plataforma de análisis de sentimiento para conversaciones de chat y otros canales de comunicación.

## Descripción

Esta aplicación permite analizar el sentimiento de mensajes en conversaciones, proporcionando métricas y resúmenes sobre la satisfacción de clientes y el rendimiento de agentes.

## Stack Tecnológico

### Backend
- **Framework**: FastAPI (Python 3.7+)
- **Base de datos**: MySQL (SQLAlchemy ORM)
- **Autenticación**: JWT (JSON Web Tokens)
- **Análisis de sentimiento**: NLTK VADER
- **Servidor**: Uvicorn

### Frontend
- **Framework**: React 18
- **Build tool**: Vite
- **UI Framework**: Material-UI (MUI)
- **Gráficos**: Recharts
- **Enrutamiento**: React Router
- **HTTP Client**: Axios

## Estructura del Proyecto

```
sentiment-platform/
├── backend/
│   ├── main.py              # Punto de entrada de FastAPI
│   ├── init_db.py           # Script de inicialización de DB
│   ├── models/
│   │   ├── database.py      # Configuración de SQLAlchemy
│   │   ├── models.py        # Modelos ORM (User, Role, SentimentHistory)
│   │   └── schemas.py       # Esquemas Pydantic
│   ├── routers/
│   │   ├── auth.py          # Endpoints de autenticación
│   │   ├── users.py         # Gestión de usuarios
│   │   ├── sentiments.py    # Análisis de sentimientos
│   │   ├── chats.py         # Endpoints de chats
│   │   ├── agents.py        # Endpoints de agentes
│   │   └── history.py       # Historial de análisis
│   ├── security/
│   │   ├── auth.py          # Dependencias de autenticación
│   │   ├── jwt.py           # Creación/validación de tokens
│   │   └── password.py      # Hash de contraseñas
│   └── utils/
│       ├── sentiment_analysis.py  # Análisis VADER
│       └── helpers.py            # Utilidades
├── frontend/
│   ├── src/
│   │   ├── pages/           # Componentes de página
│   │   ├── components/       # Componentes reutilizables
│   │   ├── services/        # Servicio API (axios)
│   │   ├── contexts/        # Contextos React (Auth)
│   │   └── App.jsx          # Router principal
│   └── package.json
└── README.md
```

## Instalación

### Prerequisites
- Python 3.7+
- Node.js 18+
- MySQL (o base de datos compatible)

### Backend

1. Crear y activar entorno virtual:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar variables de entorno (crear `.env` en backend/):
```
DATABASE_URL=mysql://user:password@localhost:3306/sentiment_db
```

4. Inicializar la base de datos:
```bash
python init_db.py
```

5. Ejecutar el servidor:
```bash
uvicorn main:app --reload
```

El servidor estará disponible en `http://127.0.0.1:8000`

### Frontend

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Crear archivo `.env` en frontend/:
```
VITE_API_URL=http://127.0.0.1:8000
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Variables de Entorno

### Backend
| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a MySQL |

### Frontend
| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del backend (default: http://127.0.0.1:8000) |

## Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Obtener usuario actual

### Análisis de Sentimiento
- `GET /sentimientos/` - Listar mensajes con análisis
- `GET /sentimientos/resumen` - Obtener resumen de sentimientos

### Historial
- `GET /historial/` - Listar historial de análisis (paginado)
- `GET /historial/{id}` - Ver detalle de un análisis
- `POST /historial/` - Crear un análisis de texto
- `DELETE /historial/{id}` - Eliminar un análisis

### Usuarios
- `GET /users/` - Listar usuarios
- `POST /users/` - Crear usuario (admin)

## Feature: Historial de Análisis de Sentimiento

El historial permite guardar y consultar análisis de sentimiento realizados.

### Datos almacenados
- **id**: Identificador único
- **text**: Texto analizado
- **sentiment**: Resultado (muy positivo, positivo, neutral, negativo, muy negativo)
- **sentiment_score**: Score compuesto VADER (-1 a 1)
- **created_at**: Timestamp de creación

### Uso del historial

1. **Crear análisis**: Envía texto al endpoint `POST /historial/` para analizar y guardar
2. **Listar historial**: `GET /historial/` con paginación y filtros
3. **Ver detalle**: `GET /historial/{id}` para ver un análisis específico
4. **Eliminar**: `DELETE /historial/{id}` para remover un análisis

## Scripts Disponibles

### Frontend
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run lint     # Verificar código con ESLint
npm run preview # Previsualizar build de producción
```

### Backend
```bash
uvicorn main:app --reload  # Servidor de desarrollo
python init_db.py          # Inicializar base de datos
```

## Notas de Producción

- La autenticación usa JWT con tiempo de expiración configurable
- Los endpoints de historial requieren autenticación
- El análisis de sentimiento usa VADER de NLTK (no requiere API externa)
- La paginación del historial soporta filtros por sentimiento
- Los datos de análisis se guardan en la tabla `sentiment_history`

## Limitaciones

- El análisis de sentimiento es basado en lexicón (VADER), no en modelos profundos
- No hay límites de rate implementados actualmente
- Los logs de error no están centralizados
- No hay tests automatizados en el repositorio

## Licencia

MIT
# Sentiment Platform

Monorepo para análisis de sentimiento en conversaciones de atención al cliente y en texto libre, con autenticación JWT y panel web.

## Stack

| Parte | Tecnologías |
|-------|-------------|
| **Backend** | FastAPI, SQLAlchemy, NLTK (VADER), JWT, Passlib |
| **Frontend** | React 18, Vite 5, MUI 6, Axios, React Router |
| **Base de datos** | MySQL (producción) o SQLite (desarrollo local por defecto) |

## Estructura del proyecto

```
sentiment-platform/
├── backend/          # API FastAPI
│   ├── main.py
│   ├── routers/      # auth, users, sentiments, historial, chats, agents
│   ├── models/
│   ├── security/
│   ├── utils/
│   ├── tests/
│   └── requirements.txt
├── frontend/         # SPA React
│   └── src/
├── docs/             # Plan e informes AI Battle
└── README.md
```

## Instalación

### Requisitos

- Python 3.10+
- Node.js 18+
- MySQL (opcional; sin `DATABASE_URL` se usa SQLite local)

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -c "import nltk; nltk.download('vader_lexicon')"
cp .env.example .env   # editar según entorno
python init_db.py      # crea roles y usuario admin
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://127.0.0.1:8000
npm run dev
```

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL SQLAlchemy. Ej. `mysql+pymysql://user:pass@localhost/db`. Si no se define: `sqlite:///./sentiment_platform.db` |

### Frontend (`frontend/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API (ej. `http://127.0.0.1:8000`) |

## Tests, build y lint

```bash
# Backend
cd backend
pytest -q

# Frontend
cd frontend
npm run build
npm run lint
```

No hay script `npm test` en el frontend; la validación principal es build + lint.

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Login (form OAuth2) |
| GET | `/auth/me` | Usuario actual |
| GET | `/sentimientos/` | Mensajes de `conversaciones` con sentimiento (on-the-fly) |
| GET | `/sentimientos/resumen` | Resumen agregado |
| **POST** | **`/historial/`** | **Analiza texto, persiste y devuelve resultado** |
| **GET** | **`/historial/`** | **Lista historial del usuario autenticado** |
| **GET** | **`/historial/{id}`** | **Detalle de un análisis** |
| **DELETE** | **`/historial/{id}`** | **Elimina un análisis** |

Documentación interactiva: `http://127.0.0.1:8000/docs`

## Feature: historial persistente

Cada análisis iniciado desde **Historial** en el frontend (o `POST /historial/`) ejecuta VADER, guarda en la tabla `sentiment_analysis_history`:

- `id`, `text`, `sentiment`, `sentiment_score`, `created_at`, `user_id`

Los registros son por usuario autenticado. El listado de conversaciones en `/sentimientos/` **no** persiste resultados (evita duplicar miles de filas en cada consulta).

Credenciales por defecto tras `init_db.py`: usuario `admin` / contraseña `adminpassword` (cambiar en producción).

## Notas de producción y limitaciones

- Cambiar `SECRET_KEY` en `backend/security/jwt.py` por variable de entorno (deuda técnica actual).
- CORS está en `allow_origins=["*"]`; restringir en producción.
- SQLite local no es adecuado para alta concurrencia; usar MySQL en producción.
- La tabla `conversaciones` debe existir en MySQL para las rutas de chats/sentimientos legacy.
- NLTK descarga `vader_lexicon` en el primer arranque si falta.

## Dependencias

Se añadió `backend/requirements.txt` con versiones acotadas compatibles con el código actual. **No** se actualizaron major versions de React ni FastAPI para evitar roturas. `pymysql` se incluye para MySQL; el frontend mantiene las versiones del `package-lock.json` existente.

# Sentiment Platform

Plataforma de **análisis de sentimiento** para conversaciones de atención al
cliente. Permite analizar el tono de los mensajes (muy positivo → muy negativo)
con el modelo VADER de NLTK, ver resúmenes agregados y, desde esta versión,
**guardar y consultar un historial persistente de análisis de texto libre**.

Monorepo con dos aplicaciones:

- **`backend/`** — API REST en **FastAPI** (Python).
- **`frontend/`** — SPA en **React + Vite + Material UI**.

---

## Stack

| Capa | Tecnologías |
|------|-------------|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.x (ORM), Pydantic 2.x, NLTK (VADER), JWT (`python-jose`), `passlib[bcrypt]` |
| Base de datos | SQLAlchemy — MySQL en producción (`PyMySQL`), **SQLite por defecto** en local/test |
| Frontend | React 18, Vite 5, Material UI 6, axios, react-router-dom 6 |
| Tests | `pytest` + `TestClient` (backend) |

---

## Estructura del proyecto

```
sentiment-platform/
├── README.md                  ← este archivo
├── docs/
│   ├── ai-battle-plan.md       ← plan de la feature de historial
│   └── ai-battle-implementation-report.md
├── backend/
│   ├── main.py                 ← app FastAPI; registra routers y crea tablas
│   ├── requirements.txt
│   ├── .env.example
│   ├── init_db.py              ← semilla de roles + usuario admin
│   ├── models/
│   │   ├── database.py         ← engine / SessionLocal / get_db
│   │   ├── models.py           ← ORM: Role, User, AnalisisHistorial
│   │   └── schemas.py          ← Pydantic
│   ├── routers/                ← auth, users, sentiments, historial, chats, agents
│   ├── security/               ← auth, jwt, password, roles
│   ├── utils/sentiment_analysis.py
│   └── tests/                  ← pytest del historial
└── frontend/
    ├── .env.example
    ├── eslint.config.js
    └── src/
        ├── App.jsx
        ├── services/api.jsx
        ├── contexts/AuthContext.jsx
        ├── components/Layout/  ← Layout, Header, Sidebar
        └── pages/              ← Dashboard, Sentiments, History, Chats, Agents, Users, Login
```

---

## Instalación

Requisitos: **Python 3.12+** y **Node.js 18+**.

```bash
git clone https://github.com/victalejo/sentiment-platform.git
cd sentiment-platform
```

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # ajusta los valores (ver más abajo)
```

> NLTK descarga el lexicón `vader_lexicon` automáticamente la primera vez que se
> analiza un texto (requiere conexión a internet esa primera vez).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # define VITE_API_URL
```

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena SQLAlchemy. Ej. MySQL: `mysql+pymysql://user:pass@host:3306/db`. **Si se deja vacía, se usa SQLite local** (`sentiment_platform.db`). |
| `SECRET_KEY` | Clave para firmar los JWT. En producción **defínela** (`python -c "import secrets; print(secrets.token_urlsafe(48))"`). |

### Frontend (`frontend/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API, ej. `http://127.0.0.1:8000`. |

---

## Cómo correr

### Backend

```bash
cd backend
# (opcional) crear roles + usuario admin inicial:
python init_db.py
uvicorn main:app --reload
```

API en `http://127.0.0.1:8000`. Documentación interactiva en `/docs` (Swagger) y `/redoc`.

### Frontend

```bash
cd frontend
npm run dev          # servidor de desarrollo (Vite)
```

---

## Tests / build / lint

```bash
# Backend — tests
cd backend && pytest

# Frontend — build de producción
cd frontend && npm run build

# Frontend — lint
cd frontend && npm run lint
```

---

## Endpoints principales

Salvo `auth/login`, todos requieren `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/login` | Login (OAuth2 password) → devuelve `access_token`. |
| `GET` | `/sentimientos/` | Mensajes con sentimiento (desde la tabla `conversaciones`). |
| `GET` | `/sentimientos/resumen` | Resumen agregado de sentimientos. |
| **`POST`** | **`/sentimientos/analizar`** | **Analiza un texto y lo guarda en el historial.** |
| **`GET`** | **`/sentimientos/historial`** | **Lista el historial (paginado, recientes primero).** |
| **`GET`** | **`/sentimientos/historial/{id}`** | **Consulta un análisis individual.** |
| **`DELETE`** | **`/sentimientos/historial/{id}`** | **Borra un análisis del historial.** |
| `GET` | `/chats/`, `/agents/` | Análisis agrupado por chat / agente. |
| `*` | `/users`, `/auth` | Gestión de usuarios y autenticación. |

### Ejemplo

```bash
# 1) Login
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/auth/login \
  -d "username=admin&password=adminpassword" | jq -r .access_token)

# 2) Analizar y guardar
curl -X POST http://127.0.0.1:8000/sentimientos/analizar \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"texto":"Me encanta este producto, es excelente"}'

# 3) Listar historial
curl http://127.0.0.1:8000/sentimientos/historial -H "Authorization: Bearer $TOKEN"
```

---

## Feature: historial persistente de análisis

Cada análisis de texto libre se persiste y puede consultarse luego.

- **Modelo** `AnalisisHistorial` (tabla `analisis_historial`):
  `id`, `texto`, `sentiment`, `sentiment_score`, `created_by`, `created_at`.
- **Backend**: endpoints `POST /sentimientos/analizar`, `GET /sentimientos/historial`,
  `GET /sentimientos/historial/{id}`, `DELETE /sentimientos/historial/{id}`. Validan
  el input (texto 1–5000 caracteres, no vacío) y devuelven errores claros (404/422/500).
- **Frontend**: página **Historial** (`/history`) con un campo para analizar texto,
  una tabla del historial, vista de detalle y borrado, con estados de *loading*,
  *error* y *empty*. Disponible en el menú lateral.

El flujo de análisis existente (sobre la tabla `conversaciones`) **no se modifica**:
la feature es completamente aditiva (tabla y endpoints propios).

---

## Notas de producción y limitaciones

- **Base de datos**: en local se usa SQLite por defecto para poder ejecutar y testear
  sin infraestructura. En producción define `DATABASE_URL` apuntando a MySQL e
  instala el driver (`PyMySQL`, ya en `requirements.txt`).
- **`SECRET_KEY`**: ahora se lee de entorno (con fallback al valor histórico para no
  romper entornos existentes). **Cámbiala en producción.**
- **CORS** está abierto a `*` en `main.py`; restringir orígenes en producción.
- **El historial no está particionado por usuario** (se guarda `created_by` con fines
  de trazabilidad, pero la lista es global). Podría filtrarse por usuario en el futuro.
- **NLTK** descarga el lexicón en runtime la primera vez; en despliegues sin red,
  pre-descargar `vader_lexicon` durante el build.
- **Dependencias frontend**: `npm audit` reporta vulnerabilidades en dependencias
  transitivas/de desarrollo. No se aplicó `npm audit fix --force` porque implica
  bumps mayores (riesgo de romper MUI 6 / Vite 5). Se documenta y se deja para una
  actualización controlada aparte.
- **Lint**: el repo no tenía `eslint.config.js` (ESLint 9 lo exige), por lo que
  `npm run lint` no funcionaba. Se añadió una configuración *flat* mínima.
```

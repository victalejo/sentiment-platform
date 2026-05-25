# AI Battle — Plan de implementación

> **Modelo que realiza el trabajo:** Claude Opus 4.7 (vía Claude Code)
> **Fecha:** 2026-05-24
> **Rama:** `ai-battle/claude-code-history-feature`

## 1. Objetivo

Implementar **historial persistente de análisis de sentimiento**: cada análisis
realizado debe guardarse y poder consultarse, verse en detalle y borrarse, tanto
desde el backend (API) como desde el frontend.

## 2. Stack detectado

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.12, FastAPI 0.115, SQLAlchemy 2.x (ORM), Pydantic 2.x |
| Auth | JWT (`python-jose`), hashing con `passlib[bcrypt]`, OAuth2 password flow |
| NLP | NLTK VADER (`SentimentIntensityAnalyzer`) |
| Base de datos | SQLAlchemy `create_engine(DATABASE_URL)` — producción apunta a MySQL |
| Frontend | React 18, Vite 5, Material UI 6, axios, react-router-dom 6 |

## 3. Estructura del repo (relevante)

```
sentiment-platform/
├── backend/
│   ├── main.py                 # App FastAPI, registra routers, crea tablas
│   ├── init_db.py              # Semilla de roles + admin
│   ├── models/
│   │   ├── database.py         # engine / SessionLocal / get_db (usa DATABASE_URL)
│   │   ├── models.py           # ORM: Role, User
│   │   └── schemas.py          # Pydantic schemas
│   ├── routers/                # auth, users, sentiments, chats, agents
│   ├── security/               # auth (get_current_user), jwt, password, roles
│   └── utils/sentiment_analysis.py  # analyze_sentiment() -> (sentimiento, score)
└── frontend/
    └── src/
        ├── App.jsx             # Rutas
        ├── services/api.jsx    # cliente axios (VITE_API_URL)
        ├── contexts/AuthContext.jsx
        ├── components/Layout/  # Layout, Header, Sidebar (definidos)
        └── pages/              # Dashboard, Sentiments, Chats, Agents, Users, Login
```

## 4. Comandos disponibles

**Backend** (no había `requirements.txt`; se añade en este PR):

```bash
pip install -r backend/requirements.txt
python -m backend.init_db          # opcional: crea roles + admin
uvicorn main:app --reload          # desde backend/
pytest                             # tests nuevos
```

**Frontend:**

```bash
npm install      # en frontend/
npm run dev
npm run build
npm run lint
```

## 5. Hallazgos / Riesgos detectados

1. **No existe `requirements.txt`** ni `.env`, y `database.py` exige `DATABASE_URL`.
   La app **no arranca tal cual**. → Mitigación: añadir `requirements.txt`,
   `.env.example` y un **fallback a SQLite** cuando `DATABASE_URL` no esté definido,
   para que el repo sea ejecutable y testeable sin MySQL.
2. **Routing del frontend incompleto**: `App.jsx` solo enruta `/login` y `/*`→Dashboard.
   `Layout`/`Sidebar` existen pero nunca se renderizan, así que los enlaces del menú
   (`/sentiments`, `/chats`…) no resuelven. → Se completa el routing con `Layout`
   + rutas anidadas para que la nueva pantalla (y las existentes) sean accesibles.
3. **`SECRET_KEY` hardcodeada** en `security/jwt.py`. → Mejora segura y no disruptiva:
   leerla de entorno con el valor actual como *fallback*.
4. El análisis actual opera sobre una tabla preexistente `conversaciones` (SQL crudo).
   El historial nuevo es **aditivo**: tabla y endpoints propios, sin tocar ese flujo.
5. NLTK descarga `vader_lexicon` en runtime (requiere red la primera vez). Los tests
   *mockean* `analyze_sentiment` para no depender de la red.

## 6. Plan antes de modificar código (orden)

1. Crear rama `ai-battle/claude-code-history-feature` ✅
2. Escribir este PLAN ✅
3. Backend: modelo + schemas + router de historial + persistencia.
4. Hacer el backend ejecutable: `requirements.txt`, `.env.example`, fallback SQLite.
5. Frontend: página Historial (analizar texto + listar + ver + borrar) y routing.
6. Tests backend (pytest) + validación manual de build/lint frontend.
7. README raíz + reporte final.
8. Commit, push, Pull Request.

## 7. Mejora principal a implementar

**Historial persistente de análisis de sentimiento.**

- **Modelo** `AnalisisHistorial` (tabla `analisis_historial`): `id`, `texto`,
  `sentiment`, `sentiment_score`, `created_by`, `created_at`.
- **Endpoints** (protegidos con `get_current_user`, agrupados bajo `/sentimientos`):
  - `POST /sentimientos/analizar` — analiza un texto y lo persiste.
  - `GET  /sentimientos/historial` — lista paginada del historial.
  - `GET  /sentimientos/historial/{id}` — consulta un análisis individual.
  - `DELETE /sentimientos/historial/{id}` — borra un análisis.
- **Frontend** página `Historial`: caja de texto + "Analizar", tabla con historial,
  ver detalle, borrar; con estados de *loading*, *error* y *empty*.

## 8. Mejoras adicionales (pequeñas, seguras, justificadas)

1. **Ejecutabilidad del repo**: `requirements.txt`, `.env.example` (backend y frontend)
   y fallback a SQLite — hoy el backend no arranca sin configuración externa.
2. **Routing del frontend completado** + entrada de menú "Historial", de modo que
   las páginas existentes (antes inalcanzables) y la nueva sean navegables.
3. **`SECRET_KEY` desde variable de entorno** (mejora de seguridad no disruptiva).
4. **Tests automatizados** del nuevo historial con `pytest` + `TestClient`.

> Criterio: cambios aditivos y acotados. No se reescribe el flujo existente ni se
> hacen bumps mayores de dependencias a ciegas.

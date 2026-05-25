# Plan de implementación — AI Battle

## Modelo

**Auto** (agente router de Cursor)

## Stack detectado

| Capa | Tecnología |
|------|------------|
| Backend | Python, FastAPI, SQLAlchemy, NLTK (VADER), JWT (python-jose), Passlib/bcrypt |
| Base de datos | MySQL vía `DATABASE_URL` (SQLAlchemy); tablas ORM para usuarios/roles; tabla SQL cruda `conversaciones` |
| Frontend | React 18, Vite 5, MUI 6, Axios, React Router 6, Recharts |
| Auth | OAuth2 password flow, Bearer JWT |

## Estructura del repositorio

```
sentiment-platform/
├── backend/
│   ├── main.py              # FastAPI app + CORS + routers
│   ├── init_db.py           # Seed roles y admin
│   ├── models/              # database, models, schemas
│   ├── routers/             # auth, users, sentiments, chats, agents
│   ├── security/            # JWT, auth, password, roles
│   └── utils/               # sentiment_analysis (VADER), helpers
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, Sentiments, Login, etc.
│   │   ├── components/      # Layout (Sidebar; Header referenciado pero ausente)
│   │   ├── contexts/        # AuthContext
│   │   └── services/        # api.jsx (axios)
│   └── package.json
└── .gitignore
```

**Observaciones:** Monorepo sin README raíz; sin `requirements.txt` en backend; sin tests automatizados; rutas del frontend incompletas (solo `Dashboard` montado en `/*`).

## Comandos disponibles

| Área | Comando | Notas |
|------|---------|-------|
| Frontend dev | `npm run dev` (en `frontend/`) | Vite |
| Frontend build | `npm run build` | |
| Frontend lint | `npm run lint` | ESLint 9 |
| Backend | `uvicorn main:app --reload` (en `backend/`) | Requiere deps Python |
| DB seed | `python init_db.py` | Usuario admin por defecto |
| Tests | No existen scripts `pytest` / `npm test` configurados | Añadir pytest |

## Riesgos

1. **MySQL obligatorio hoy:** Sin `DATABASE_URL` el backend no arranca; mitigar con fallback SQLite documentado para desarrollo/tests.
2. **Análisis no persistido actualmente:** Los GET de `/sentimientos/` recalculan VADER en cada request sobre `conversaciones`; no guardar ahí evita duplicados masivos.
3. **JWT secret hardcodeado** en `jwt.py` — no tocar en este PR salvo documentar; riesgo de seguridad preexistente.
4. **Header.jsx ausente** — `Layout` no se usa; al activar rutas hay que añadir Header mínimo.
5. **Sin lockfile Python** — crear `requirements.txt` con versiones razonables.

## Plan antes de modificar código

1. Rama `ai-battle/cursor-history-feature`.
2. Modelo ORM `SentimentAnalysisHistory` + schemas Pydantic con validación de texto.
3. Router `/historial`: POST (analizar + guardar), GET lista, GET `/{id}`, DELETE `/{id}`; auth requerida; timestamps UTC.
4. Fallback SQLite si no hay `DATABASE_URL`.
5. Frontend: página Historial con formulario de análisis, lista, detalle, borrar; estados loading/error/empty; enlace en Sidebar.
6. Corregir rutas en `App.jsx` + `Layout` + `Header` mínimo (no romper Dashboard/Sentiments).
7. `requirements.txt`, tests pytest con SQLite en memoria, README raíz.
8. Validar: `npm run build`, `npm run lint`, `pytest`.
9. PR y `docs/ai-battle-implementation-report.md`.

## Mejora principal

**Historial persistente de análisis de sentimiento:** cada análisis vía POST queda en BD con id, texto, sentimiento, score y `created_at`; CRUD de consulta y borrado desde API y UI.

## Mejoras adicionales (opcionales)

1. **Tests pytest** para endpoints de historial (SQLite in-memory).
2. **Rutas frontend + Header** para que Sidebar y páginas existentes funcionen; DX y accesibilidad básica en la nueva página.

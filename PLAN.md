# AI Battle Plan - Sentiment History Feature

## Modelo que realiza el trabajo

**MiniMax-M2** (minimax-coding-plan/MiniMax-M2.7)

## Stack detectado

- **Backend**: FastAPI (Python), SQLAlchemy, MySQL, JWT auth, NLTK VADER sentiment
- **Frontend**: React 18, Vite, MUI (Material-UI), Recharts, React Router, Axios, JWT decode
- **Monorepo**: `/backend` y `/frontend` independientes

## Estructura del repo

```
sentiment-platform/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── init_db.py           # DB initialization script
│   ├── models/
│   │   ├── database.py      # SQLAlchemy engine/session
│   │   ├── models.py       # SQLAlchemy ORM models (User, Role)
│   │   └── schemas.py      # Pydantic schemas
│   ├── routers/
│   │   ├── sentiments.py   # Sentiment analysis endpoints
│   │   ├── auth.py          # Auth endpoints
│   │   ├── users.py        # User management
│   │   ├── chats.py        # Chat endpoints
│   │   └── agents.py       # Agent endpoints
│   ├── security/
│   │   ├── auth.py         # JWT auth dependencies
│   │   ├── jwt.py          # JWT token creation
│   │   └── password.py     # Password hashing
│   └── utils/
│       ├── sentiment_analysis.py  # VADER sentiment analysis
│       └── helpers.py            # Utility functions
├── frontend/
│   ├── src/
│   │   ├── pages/          # React page components
│   │   ├── components/     # React components
│   │   ├── services/       # API service (axios)
│   │   ├── contexts/       # React contexts (Auth)
│   │   └── App.jsx         # Main router
│   └── package.json
└── .gitignore
```

## Comandos disponibles

**Backend**:
- `uvicorn main:app --reload` - Run FastAPI server
- `python init_db.py` - Initialize database

**Frontend**:
- `npm install` - Install dependencies
- `npm run dev` - Run Vite dev server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Mejora principal a implementar

**Historial persistente de análisis de sentimiento**

Cada vez que se realiza un análisis de sentimiento, se guardará en una tabla `sentiment_history` para consulta futura.

### Datos a guardar:
- `id` - Primary key
- `text` - Texto analizado
- `sentiment` - Resultado (muy positivo, positivo, neutral, negativo, muy negativo)
- `sentiment_score` - Score compuesto de VADER (-1 a 1)
- `created_at` - Timestamp de creación

### Endpoints a crear:
- `GET /historial` - Listar todo el historial (con paginación)
- `GET /historial/{id}` - Obtener un análisis específico
- `DELETE /historial/{id}` - Eliminar un análisis
- `POST /historial` - Crear un análisis (para uso interno)

## 1-2 mejoras adicionales opcionales

1. **Empty states en frontend** - Mostrar mensaje cuando no hay datos en el historial
2. **Mejora en validación de inputs** - Validación más robusta en endpoints de historial

## Riesgos

1. La base de datos es MySQL, el modelo actual usa SQLAlchemy con create_engine - verificar que soporte la tabla de historial
2. No hay tests existentes, no puedo romper tests pero debo validar manualmente que todo funcione
3. El análisis actual se hace en tiempo real (consulta SQL + análisis VADER en el momento). El historial guardará solo el resultado, no la conversación original de donde viene

## Plan antes de modificar código

1. ✅ Inspect repository structure
2. ⬜ Create branch `ai-battle/minimax-history-feature`
3. ⬜ Create backend model `SentimentHistory`
4. ⬜ Create history endpoints in new router `routers/history.py`
5. ⬜ Modify `routers/sentiments.py` to save analysis to history table
6. ⬜ Create frontend `History.jsx` page with list/detail/delete
7. ⬜ Add history route to `App.jsx` and navigation to `Sidebar.jsx`
8. ⬜ Create root `README.md`
9. ⬜ Validate build/lint
10. ⬜ Create PR
11. ⬜ Create implementation report
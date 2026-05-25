# Sentiment Platform

Plataforma web para analizar sentimiento en conversaciones y textos individuales. El backend expone una API FastAPI con autenticacion bearer y el frontend ofrece una interfaz React/Vite para consultar resumenes, mensajes, chats, agentes, usuarios e historial persistente de analisis.

## Stack

- Backend: Python, FastAPI, SQLAlchemy, Pydantic, NLTK VADER, JWT/OAuth2.
- Frontend: React 18, Vite, Material UI, Axios, React Router, Recharts.
- Base de datos: SQLAlchemy mediante `DATABASE_URL`. El repo documenta MySQL para conversaciones; SQLite puede usarse en desarrollo/tests si se configura en `DATABASE_URL`.

## Estructura

```text
sentiment-platform/
├── backend/
│   ├── main.py
│   ├── init_db.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── models/
│   ├── routers/
│   ├── security/
│   ├── tests/
│   └── utils/
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       └── services/
└── PLAN.md
```

## Variables de entorno

Backend:

- `DATABASE_URL`: obligatoria para arrancar la API. Ejemplos:
  - `mysql+mysqlconnector://user:password@localhost:3306/sentiment_platform`
  - `sqlite:///./sentiment_platform.sqlite`

Frontend:

- `VITE_API_URL`: URL base del backend, por ejemplo `http://127.0.0.1:8000`.

Nota: `backend/security/jwt.py` todavia usa un `SECRET_KEY` hardcoded heredado. Para produccion debe moverse a variable de entorno antes de exponer el sistema.

## Instalacion

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
```

Frontend:

```bash
cd frontend
npm install
```

## Correr backend

```bash
cd backend
uvicorn main:app --reload
```

Inicializar roles y usuario admin:

```bash
cd backend
python init_db.py
```

El usuario admin creado por el script usa credenciales de ejemplo; cambialas antes de cualquier uso real.

## Correr frontend

```bash
cd frontend
npm run dev
```

## Tests, build y lint

Backend:

```bash
cd backend
pytest
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

No hay suite de tests frontend configurada en este momento.

## Endpoints principales

Autenticacion:

- `POST /auth/login`: obtiene token bearer.
- `GET /auth/me`: usuario autenticado.

Sentimientos:

- `GET /sentimientos/`: lista mensajes de la tabla `conversaciones` con sentimiento calculado al vuelo.
- `GET /sentimientos/resumen`: resumen agregado de sentimientos.
- `POST /sentimientos/analizar`: analiza texto enviado y guarda el resultado en historial.
- `GET /sentimientos/historial`: lista historial persistente del usuario autenticado.
- `GET /sentimientos/historial/{analysis_id}`: consulta un analisis guardado.
- `DELETE /sentimientos/historial/{analysis_id}`: borra un analisis guardado.

Otros modulos:

- `GET /chats/`
- `GET /chats/resumen`
- `GET /agents/`
- `GET /agents/resumen`
- `GET /users`

## Historial persistente

La feature agrega una tabla `sentiment_analysis_history` con:

- `id`
- `text`
- `sentiment`
- `sentiment_score`
- `created_at`
- `created_by_user_id`

Desde el frontend, la pagina `/sentiments` permite analizar un texto, ver el resultado inmediato, listar el historial, abrir el detalle de un analisis anterior y borrar registros. Tambien mantiene la consulta existente de mensajes desde `conversaciones`.

## Dependencias

- Se agregaron `backend/requirements.txt` y `backend/requirements-dev.txt` porque el backend no tenia archivo instalable.
- Se ejecuto `npm audit fix` sin `--force`, actualizando el lockfile dentro de rangos semver y dejando `npm audit --omit=dev` sin vulnerabilidades.
- No se ejecuto `npm audit fix --force`: resolver las vulnerabilidades moderadas restantes de dev requiere saltar a Vite 8, un cambio mayor que merece una ronda dedicada.

## Notas de produccion y limitaciones

- No hay sistema de migraciones; `Base.metadata.create_all(bind=engine)` crea tablas faltantes al arrancar, pero no gestiona cambios complejos de esquema.
- Los endpoints estan protegidos por token bearer, pero el secreto JWT debe salir del codigo.
- NLTK puede descargar `vader_lexicon` durante el import si no esta disponible.
- La tabla `conversaciones` usada por endpoints legacy no esta modelada en SQLAlchemy dentro del repo.
- SQLite es util para desarrollo o tests, pero produccion deberia usar una base persistente administrada y respaldada.

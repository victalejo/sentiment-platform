# AI Battle Plan

## Modelo

GPT-5 Codex.

## Stack detectado

- Backend: FastAPI, Python, SQLAlchemy, Pydantic, NLTK VADER para sentimiento, JWT/OAuth2 bearer, `python-dotenv`.
- Frontend: React 18, Vite, Material UI, Axios, React Router, Recharts.
- Base de datos: configurada por `DATABASE_URL` mediante SQLAlchemy. La documentacion existente habla de MySQL para conversaciones; SQLite solo seria fallback local si se configura explicitamente.

## Estructura del repo

```text
sentiment-platform/
├── backend/
│   ├── main.py
│   ├── init_db.py
│   ├── models/
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── routers/
│   │   ├── agents.py
│   │   ├── auth.py
│   │   ├── chats.py
│   │   ├── sentiments.py
│   │   └── users.py
│   ├── security/
│   └── utils/
└── frontend/
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── pages/
        ├── services/
        ├── contexts/
        └── components/
```

## Comandos disponibles

- Backend:
  - `uvicorn main:app --reload` desde `backend/`.
  - `python init_db.py` desde `backend/` para inicializar roles/admin.
  - No se encontro `requirements.txt`, `pyproject.toml` ni suite de tests Python.
- Frontend:
  - `npm install` desde `frontend/`.
  - `npm run dev`.
  - `npm run build`.
  - `npm run lint`.
  - `npm run preview`.

## Riesgos

- El backend no declara dependencias en un archivo instalable; eso dificulta reproducibilidad y CI.
- `DATABASE_URL` es obligatorio en el arranque actual. Si falta, `create_engine` falla.
- Los endpoints existentes de sentimientos calculan resultados al vuelo desde una tabla `conversaciones` que no esta modelada en SQLAlchemy.
- Varias rutas requieren autenticacion bearer; validar manualmente endpoints protegidos exige crear/iniciar un usuario.
- NLTK intenta descargar `vader_lexicon` en import time si no existe localmente.
- Algunos routers existentes usan SQL crudo con estilos de parametros mixtos; evitar tocar eso salvo que sea necesario para la feature.

## Plan antes de modificar codigo

1. Crear una tabla ORM pequena para historial persistente de analisis.
2. Agregar schemas Pydantic para request/responses del historial.
3. Crear endpoints bajo `/sentimientos` para analizar texto y persistirlo, listar historial, consultar un registro y borrar un registro.
4. Mantener los endpoints actuales de conversaciones sin romper su contrato.
5. Actualizar la pantalla de sentimientos para permitir analisis manual persistente, mostrar historial con loading/error/empty states, ver detalle y borrar registros.
6. Crear `README.md` raiz con instalacion, variables, comandos, endpoints y limitaciones.
7. Agregar validacion ligera y manejo de errores claro.
8. Ejecutar validacion real de frontend y backend; documentar cualquier falla honestamente.
9. Crear reporte final en Markdown y abrir PR desde la rama `ai-battle/codex-history-feature`.

## Mejora principal

Historial persistente de analisis de sentimiento con API CRUD basica y UI integrada.

## Mejoras adicionales opcionales

- Agregar `requirements.txt` del backend con dependencias actuales para mejorar DX y reproducibilidad.
- Agregar tests backend enfocados en la nueva feature usando SQLite temporal, si el setup del repo lo permite sin reescrituras grandes.

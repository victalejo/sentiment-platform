# main.py

from fastapi import FastAPI
from routers import chats, agents, sentiments, auth, users
from models.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

# Crear las tablas en la base de datos (solo la primera vez)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Análisis de Sentimientos")

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes permitir más dominios agregándolos en esta lista
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los encabezados
)

# Incluir los routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sentiments.router)  # Asegúrate de incluir este router
app.include_router(chats.router)
app.include_router(agents.router)

# main.py

from fastapi import FastAPI
from routers import chats, agents, sentiments, auth, users
from models.database import Base, engine

# Crear las tablas en la base de datos (solo la primera vez)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API de Análisis de Sentimientos")

# Incluir los routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(chats.router, prefix="/chats", tags=["Chats"])
app.include_router(agents.router, prefix="/agents", tags=["Agentes"])
app.include_router(sentiments.router, prefix="/sentimientos", tags=["Sentimientos"])

from fastapi import FastAPI
from routers import chats, agents, sentiments

app = FastAPI(title="API de Análisis de Sentimientos")

# Incluir los routers
app.include_router(chats.router, prefix="/chats", tags=["Chats"])
app.include_router(agents.router, prefix="/agents", tags=["Agentes"])
app.include_router(sentiments.router, prefix="/sentimientos", tags=["Sentimientos"])

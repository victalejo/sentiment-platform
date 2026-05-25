# models/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# DATABASE_URL apunta a MySQL en producción (ver .env.example). Si no está
# definida, se usa SQLite local para que el proyecto sea ejecutable y testeable
# sin necesidad de una base de datos externa.
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./sentiment_platform.db')

# SQLite requiere desactivar la verificación de hilos para usarse con FastAPI.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

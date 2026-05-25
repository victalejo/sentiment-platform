"""Configuración de pruebas para el historial de análisis de sentimiento.

Usa una base de datos SQLite en memoria aislada y sobreescribe las dependencias
de autenticación y análisis para no depender de MySQL, JWT real ni de la red
(descarga del lexicón VADER).
"""

import os
import types

import pytest

# Evita que la importación de `main` necesite MySQL: fuerza SQLite local.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_app.db")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from models.database import Base, get_db
from security.auth import get_current_user
import routers.historial as historial_router
import main

# Motor SQLite en memoria compartido entre conexiones (StaticPool).
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def _override_get_current_user():
    # Usuario simulado; los endpoints solo usan `.username`.
    return types.SimpleNamespace(id=1, username="tester")


def _fake_analyze(texto: str):
    t = texto.lower()
    if any(p in t for p in ("excelente", "feliz", "great", "encanta")):
        return ("muy positivo", 0.9)
    if any(p in t for p in ("terrible", "odio", "pesimo", "horrible")):
        return ("muy negativo", -0.9)
    return ("neutral", 0.0)


@pytest.fixture(autouse=True)
def _reset_db_and_overrides(monkeypatch):
    # Esquema limpio por test.
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    main.app.dependency_overrides[get_db] = _override_get_db
    main.app.dependency_overrides[get_current_user] = _override_get_current_user
    # Análisis determinista y sin red.
    monkeypatch.setattr(historial_router, "analyze_sentiment", _fake_analyze)

    yield

    main.app.dependency_overrides.clear()


@pytest.fixture()
def client():
    return TestClient(main.app)

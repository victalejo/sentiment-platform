import os

os.environ.setdefault('DATABASE_URL', 'sqlite:///:memory:')

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from models.database import Base, get_db
from models import models
from security import jwt, password


@pytest.fixture()
def client():
    engine = create_engine(
        'sqlite:///:memory:',
        connect_args={'check_same_thread': False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    db = TestingSessionLocal()
    role = models.Role(name='user')
    db.add(role)
    db.commit()
    hashed = password.hash_password('testpass')
    user = models.User(
        username='tester',
        email='tester@example.com',
        hashed_password=hashed,
        is_active=True,
    )
    user.roles.append(role)
    db.add(user)
    db.commit()
    db.close()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def _auth_headers(client: TestClient) -> dict:
    response = client.post(
        '/auth/login',
        data={'username': 'tester', 'password': 'testpass'},
    )
    assert response.status_code == 200
    token = response.json()['access_token']
    return {'Authorization': f'Bearer {token}'}


def test_crear_y_listar_historial(client: TestClient):
    headers = _auth_headers(client)
    create = client.post(
        '/historial/',
        json={'text': 'Excelente servicio, muy contento'},
        headers=headers,
    )
    assert create.status_code == 201
    body = create.json()
    assert body['id'] > 0
    assert body['sentiment'] in {'muy positivo', 'positivo', 'neutral', 'negativo', 'muy negativo'}
    assert isinstance(body['sentiment_score'], float)
    assert 'created_at' in body

    listing = client.get('/historial/', headers=headers)
    assert listing.status_code == 200
    assert len(listing.json()) == 1


def test_obtener_y_eliminar_historial(client: TestClient):
    headers = _auth_headers(client)
    created = client.post(
        '/historial/',
        json={'text': 'Terrible experiencia'},
        headers=headers,
    ).json()
    analysis_id = created['id']

    detail = client.get(f'/historial/{analysis_id}', headers=headers)
    assert detail.status_code == 200
    assert detail.json()['text'] == 'Terrible experiencia'

    deleted = client.delete(f'/historial/{analysis_id}', headers=headers)
    assert deleted.status_code == 204

    missing = client.get(f'/historial/{analysis_id}', headers=headers)
    assert missing.status_code == 404


def test_texto_vacio_rechazado(client: TestClient):
    headers = _auth_headers(client)
    response = client.post('/historial/', json={'text': '   '}, headers=headers)
    assert response.status_code == 422


def test_historial_requiere_auth(client: TestClient):
    response = client.get('/historial/')
    assert response.status_code == 401

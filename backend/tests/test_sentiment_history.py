import os
from pathlib import Path

os.environ["DATABASE_URL"] = f"sqlite:///{Path(__file__).with_name('test_history.sqlite').as_posix()}"

from fastapi.testclient import TestClient

from main import app
from models import models
from models.database import Base, engine
from security.auth import get_current_user


def override_current_user():
    return models.User(
        id=1,
        username="history-tester",
        email="history-tester@example.com",
        hashed_password="not-used",
        is_active=True,
    )


app.dependency_overrides[get_current_user] = override_current_user
client = TestClient(app)


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_sentiment_analysis_history_crud():
    create_response = client.post(
        "/sentimientos/analizar",
        json={"text": "I love this support experience"},
    )

    assert create_response.status_code == 200
    created = create_response.json()
    assert created["id"]
    assert created["text"] == "I love this support experience"
    assert created["sentiment"] in {
        "muy positivo",
        "positivo",
        "neutral",
        "negativo",
        "muy negativo",
    }
    assert isinstance(created["sentiment_score"], float)
    assert created["created_at"]
    assert created["created_by_user_id"] == 1

    list_response = client.get("/sentimientos/historial")
    assert list_response.status_code == 200
    history = list_response.json()
    assert len(history) == 1
    assert history[0]["id"] == created["id"]

    detail_response = client.get(f"/sentimientos/historial/{created['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["id"] == created["id"]

    delete_response = client.delete(f"/sentimientos/historial/{created['id']}")
    assert delete_response.status_code == 204

    missing_response = client.get(f"/sentimientos/historial/{created['id']}")
    assert missing_response.status_code == 404


def test_sentiment_analysis_rejects_blank_text():
    response = client.post("/sentimientos/analizar", json={"text": "   "})

    assert response.status_code == 422
    assert "vacio" in response.text

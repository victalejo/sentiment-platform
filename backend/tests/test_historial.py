"""Pruebas de los endpoints del historial de análisis de sentimiento."""


def test_analizar_crea_registro(client):
    resp = client.post("/sentimientos/analizar", json={"texto": "Esto es excelente"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] > 0
    assert data["texto"] == "Esto es excelente"
    assert data["sentiment"] == "muy positivo"
    assert data["sentiment_score"] == 0.9
    assert data["created_by"] == "tester"
    assert "created_at" in data


def test_analizar_recorta_y_valida_vacio(client):
    # Texto solo con espacios -> 422 por validación.
    resp = client.post("/sentimientos/analizar", json={"texto": "   "})
    assert resp.status_code == 422

    # Texto vacío -> 422 por min_length.
    resp = client.post("/sentimientos/analizar", json={"texto": ""})
    assert resp.status_code == 422

    # Falta el campo -> 422.
    resp = client.post("/sentimientos/analizar", json={})
    assert resp.status_code == 422


def test_listar_historial_ordenado(client):
    client.post("/sentimientos/analizar", json={"texto": "odio esto"})
    client.post("/sentimientos/analizar", json={"texto": "me encanta"})

    resp = client.get("/sentimientos/historial")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 2
    # El más reciente primero.
    assert items[0]["texto"] == "me encanta"
    assert items[0]["sentiment"] == "muy positivo"
    assert items[1]["sentiment"] == "muy negativo"


def test_listar_historial_vacio(client):
    resp = client.get("/sentimientos/historial")
    assert resp.status_code == 200
    assert resp.json() == []


def test_obtener_individual(client):
    creado = client.post("/sentimientos/analizar", json={"texto": "texto neutro"}).json()
    analisis_id = creado["id"]

    resp = client.get(f"/sentimientos/historial/{analisis_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == analisis_id

    # Inexistente -> 404.
    assert client.get("/sentimientos/historial/99999").status_code == 404


def test_borrar_analisis(client):
    creado = client.post("/sentimientos/analizar", json={"texto": "algo"}).json()
    analisis_id = creado["id"]

    resp = client.delete(f"/sentimientos/historial/{analisis_id}")
    assert resp.status_code == 204

    # Ya no existe.
    assert client.get(f"/sentimientos/historial/{analisis_id}").status_code == 404
    # Borrar de nuevo -> 404.
    assert client.delete(f"/sentimientos/historial/{analisis_id}").status_code == 404


def test_paginacion_limit(client):
    for i in range(3):
        client.post("/sentimientos/analizar", json={"texto": f"mensaje {i}"})

    resp = client.get("/sentimientos/historial", params={"limit": 2})
    assert resp.status_code == 200
    assert len(resp.json()) == 2

# routers/historial.py
#
# Historial persistente de análisis de sentimiento sobre texto libre.
# Cada análisis se guarda y puede listarse, consultarse o borrarse.

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List

from sqlalchemy.orm import Session

from models import schemas, models
from models.database import get_db
from utils.sentiment_analysis import analyze_sentiment
from security.auth import get_current_user

router = APIRouter(
    tags=["Historial"],
    prefix="/sentimientos",
)


@router.post(
    "/analizar",
    response_model=schemas.AnalisisHistorial,
    status_code=status.HTTP_201_CREATED,
    summary="Analiza un texto y guarda el resultado en el historial",
)
def analizar_y_guardar(
    payload: schemas.AnalisisRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Ejecuta el análisis de sentimiento sobre `texto` y persiste el resultado."""
    try:
        sentimiento, score = analyze_sentiment(payload.texto)
    except Exception as exc:  # noqa: BLE001 - se devuelve un error claro al cliente
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al analizar el texto: {exc}",
        )

    registro = models.AnalisisHistorial(
        texto=payload.texto,
        sentiment=sentimiento,
        sentiment_score=float(score),
        created_by=current_user.username,
    )

    try:
        db.add(registro)
        db.commit()
        db.refresh(registro)
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar el análisis: {exc}",
        )

    return registro


@router.get(
    "/historial",
    response_model=List[schemas.AnalisisHistorial],
    summary="Lista el historial de análisis (más recientes primero)",
)
def listar_historial(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(50, ge=1, le=200, description="Máximo de registros a devolver"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Devuelve el historial paginado, ordenado por fecha de creación descendente."""
    return (
        db.query(models.AnalisisHistorial)
        .order_by(models.AnalisisHistorial.created_at.desc(), models.AnalisisHistorial.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get(
    "/historial/{analisis_id}",
    response_model=schemas.AnalisisHistorial,
    summary="Consulta un análisis individual por id",
)
def obtener_analisis(
    analisis_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    registro = (
        db.query(models.AnalisisHistorial)
        .filter(models.AnalisisHistorial.id == analisis_id)
        .first()
    )
    if registro is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe un análisis con id {analisis_id}.",
        )
    return registro


@router.delete(
    "/historial/{analisis_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Borra un análisis del historial",
)
def borrar_analisis(
    analisis_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    registro = (
        db.query(models.AnalisisHistorial)
        .filter(models.AnalisisHistorial.id == analisis_id)
        .first()
    )
    if registro is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No existe un análisis con id {analisis_id}.",
        )

    try:
        db.delete(registro)
        db.commit()
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al borrar el análisis: {exc}",
        )

    return None

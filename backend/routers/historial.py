from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models import models, schemas
from models.database import get_db
from security.auth import get_current_user
from utils.sentiment_analysis import analyze_sentiment

router = APIRouter(
    tags=["Historial de análisis"],
    prefix="/historial",
)


def _to_history_item(record: models.SentimentAnalysisHistory) -> schemas.SentimentAnalysisHistoryItem:
    return schemas.SentimentAnalysisHistoryItem(
        id=record.id,
        text=record.text,
        sentiment=record.sentiment,
        sentiment_score=record.sentiment_score,
        created_at=record.created_at,
    )


@router.post("/", response_model=schemas.SentimentAnalysisHistoryItem, status_code=status.HTTP_201_CREATED)
def crear_analisis(
    payload: schemas.SentimentAnalysisCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    sentiment, score = analyze_sentiment(payload.text)
    record = models.SentimentAnalysisHistory(
        text=payload.text,
        sentiment=sentiment,
        sentiment_score=score,
        created_at=datetime.utcnow(),
        user_id=current_user.id,
    )
    try:
        db.add(record)
        db.commit()
        db.refresh(record)
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No se pudo guardar el análisis: {exc}",
        ) from exc
    return _to_history_item(record)


@router.get("/", response_model=List[schemas.SentimentAnalysisHistoryItem])
def listar_historial(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    records = (
        db.query(models.SentimentAnalysisHistory)
        .filter(models.SentimentAnalysisHistory.user_id == current_user.id)
        .order_by(models.SentimentAnalysisHistory.created_at.desc())
        .all()
    )
    return [_to_history_item(record) for record in records]


@router.get("/{analysis_id}", response_model=schemas.SentimentAnalysisHistoryItem)
def obtener_analisis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.SentimentAnalysisHistory)
        .filter(
            models.SentimentAnalysisHistory.id == analysis_id,
            models.SentimentAnalysisHistory.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Análisis con id {analysis_id} no encontrado",
        )
    return _to_history_item(record)


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_analisis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    record = (
        db.query(models.SentimentAnalysisHistory)
        .filter(
            models.SentimentAnalysisHistory.id == analysis_id,
            models.SentimentAnalysisHistory.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Análisis con id {analysis_id} no encontrado",
        )
    try:
        db.delete(record)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No se pudo eliminar el análisis: {exc}",
        ) from exc

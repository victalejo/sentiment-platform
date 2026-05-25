from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from models import schemas, models
from models.database import get_db
from security.auth import get_current_user

router = APIRouter(
    tags=["Historial de Sentimientos"],
    prefix="/historial"
)


@router.post("/", response_model=schemas.SentimentHistoryResponse, status_code=201)
def create_sentiment_history(
    history: schemas.SentimentHistoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    from utils.sentiment_analysis import analyze_sentiment
    sentiment, sentiment_score = analyze_sentiment(history.text)

    db_history = models.SentimentHistory(
        text=history.text,
        sentiment=sentiment,
        sentiment_score=sentiment_score
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history


@router.get("/", response_model=schemas.SentimentHistoryListResponse)
def list_sentiment_history(
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Elementos por página"),
    sentiment: str = Query(None, description="Filtrar por sentimiento"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.SentimentHistory)

    if sentiment:
        query = query.filter(models.SentimentHistory.sentiment == sentiment)

    total = query.count()
    items = query.order_by(desc(models.SentimentHistory.created_at)) \
        .offset((page - 1) * page_size) \
        .limit(page_size) \
        .all()

    return schemas.SentimentHistoryListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{history_id}", response_model=schemas.SentimentHistoryResponse)
def get_sentiment_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    history = db.query(models.SentimentHistory).filter(
        models.SentimentHistory.id == history_id
    ).first()

    if not history:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")

    return history


@router.delete("/{history_id}", status_code=204)
def delete_sentiment_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    history = db.query(models.SentimentHistory).filter(
        models.SentimentHistory.id == history_id
    ).first()

    if not history:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")

    db.delete(history)
    db.commit()
    return None
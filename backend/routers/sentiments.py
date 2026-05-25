# routers/sentiments.py

from fastapi import APIRouter, Query, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime

from models import schemas, models
from models.database import get_db
from utils.sentiment_analysis import analyze_sentiment
from utils.helpers import is_base64
from sqlalchemy.orm import Session
from sqlalchemy import text  # Importar text para consultas SQL crudas
from sqlalchemy.exc import SQLAlchemyError
from security.auth import get_current_user

router = APIRouter(
    tags=["Sentimientos"],
    prefix="/sentimientos"
)


def _get_history_record(
    analysis_id: int,
    db: Session,
    current_user: models.User
) -> Optional[models.SentimentAnalysisHistory]:
    query = db.query(models.SentimentAnalysisHistory).filter(
        models.SentimentAnalysisHistory.id == analysis_id
    )
    if current_user.id is not None:
        query = query.filter(
            models.SentimentAnalysisHistory.created_by_user_id == current_user.id
        )
    return query.first()


@router.post("/analizar", response_model=schemas.SentimentAnalysisHistory)
def analizar_sentimiento(
    payload: schemas.SentimentAnalysisCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    sentimiento, sentiment_score = analyze_sentiment(payload.text)
    history_record = models.SentimentAnalysisHistory(
        text=payload.text,
        sentiment=sentimiento,
        sentiment_score=sentiment_score,
        created_by_user_id=current_user.id
    )

    try:
        db.add(history_record)
        db.commit()
        db.refresh(history_record)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No se pudo guardar el analisis de sentimiento: {str(exc)}"
        )

    return history_record


@router.get("/historial", response_model=List[schemas.SentimentAnalysisHistory])
def listar_historial_sentimientos(
    limit: int = Query(50, ge=1, le=100, description="Cantidad maxima de registros"),
    offset: int = Query(0, ge=0, description="Cantidad de registros a omitir"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.SentimentAnalysisHistory)
    if current_user.id is not None:
        query = query.filter(
            models.SentimentAnalysisHistory.created_by_user_id == current_user.id
        )

    return (
        query
        .order_by(models.SentimentAnalysisHistory.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/historial/{analysis_id}", response_model=schemas.SentimentAnalysisHistory)
def obtener_historial_sentimiento(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    history_record = _get_history_record(analysis_id, db, current_user)
    if not history_record:
        raise HTTPException(status_code=404, detail="Analisis no encontrado")
    return history_record


@router.delete("/historial/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_historial_sentimiento(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    history_record = _get_history_record(analysis_id, db, current_user)
    if not history_record:
        raise HTTPException(status_code=404, detail="Analisis no encontrado")

    try:
        db.delete(history_record)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No se pudo borrar el analisis: {str(exc)}"
        )


@router.get("/", response_model=List[schemas.MensajeConSentimiento])
def obtener_sentimientos(
    agent_name: Optional[str] = Query(None, description="Nombre del agente"),
    customer_name: Optional[str] = Query(None, description="Nombre del cliente"),
    channel: Optional[str] = Query(None, description="Canal de comunicación"),
    de: Optional[str] = Query(None, description="Remitente del mensaje"),
    date_from: Optional[datetime] = Query(None, description="Fecha inicial"),
    date_to: Optional[datetime] = Query(None, description="Fecha final"),
    sentiment: Optional[str] = Query(None, description="Tipo de sentimiento: muy positivo, positivo, neutral, negativo, muy negativo"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    sql = "SELECT * FROM conversaciones WHERE 1=1"
    params = {}

    # Aplicación de filtros
    if agent_name:
        sql += " AND agent_name = :agent_name"
        params["agent_name"] = agent_name
    if customer_name:
        sql += " AND customer_name = :customer_name"
        params["customer_name"] = customer_name
    if channel:
        sql += " AND channel = :channel"
        params["channel"] = channel
    if de:
        sql += " AND de = :de"
        params["de"] = de
    if date_from:
        sql += " AND date >= :date_from"
        params["date_from"] = date_from
    if date_to:
        sql += " AND date <= :date_to"
        params["date_to"] = date_to

    # Ejecutar la consulta usando text() y mappings()
    try:
        cursor = db.execute(text(sql), params)
        resultados = cursor.mappings().all()  # Obtener resultados como diccionarios
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al ejecutar la consulta: {str(e)}")

    mensajes_con_sentimiento = []
    for mensaje in resultados:
        texto = mensaje['message']
        if is_base64(texto):
            continue  # Ignorar mensajes en base64

        sentimiento, sentiment_score = analyze_sentiment(texto)

        # Aplicar filtro de sentimiento si se especifica
        if sentiment and sentimiento.lower() != sentiment.lower():
            continue

        mensaje_con_sentimiento = schemas.MensajeConSentimiento(
            conn_id=mensaje['conn_id'],
            agent_name=mensaje['agent_name'],
            customer_name=mensaje['customer_name'],
            channel=mensaje['channel'],
            de=mensaje['de'],
            from_name=mensaje['from_name'],
            to_name=mensaje['to_name'],
            date=mensaje['date'],
            message=mensaje['message'],
            sentiment=sentimiento,
            sentiment_score=sentiment_score
        )
        mensajes_con_sentimiento.append(mensaje_con_sentimiento)

    cursor.close()
    return mensajes_con_sentimiento

@router.get("/resumen", response_model=schemas.SentimentSummary)
def obtener_resumen_sentimientos(
    agent_name: Optional[str] = Query(None, description="Nombre del agente"),
    customer_name: Optional[str] = Query(None, description="Nombre del cliente"),
    channel: Optional[str] = Query(None, description="Canal de comunicación"),
    de: Optional[str] = Query(None, description="Remitente del mensaje"),
    date_from: Optional[datetime] = Query(None, description="Fecha inicial"),
    date_to: Optional[datetime] = Query(None, description="Fecha final"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    sql = "SELECT message FROM conversaciones WHERE 1=1"
    params = {}

    # Aplicación de filtros
    if agent_name:
        sql += " AND agent_name = :agent_name"
        params["agent_name"] = agent_name
    if customer_name:
        sql += " AND customer_name = :customer_name"
        params["customer_name"] = customer_name
    if channel:
        sql += " AND channel = :channel"
        params["channel"] = channel
    if de:
        sql += " AND de = :de"
        params["de"] = de
    if date_from:
        sql += " AND date >= :date_from"
        params["date_from"] = date_from
    if date_to:
        sql += " AND date <= :date_to"
        params["date_to"] = date_to

    # Ejecutar la consulta usando text() y mappings()
    try:
        cursor = db.execute(text(sql), params)
        resultados = cursor.mappings().all()  # Obtener resultados como diccionarios
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al ejecutar la consulta: {str(e)}")

    total_messages = 0
    very_positive = 0
    positive = 0
    neutral = 0
    negative = 0
    very_negative = 0

    for mensaje in resultados:
        texto = mensaje['message']
        if is_base64(texto):
            continue  # Ignorar mensajes en base64

        sentimiento, _ = analyze_sentiment(texto)
        total_messages += 1
        if sentimiento.lower() == 'muy positivo':
            very_positive += 1
        elif sentimiento.lower() == 'positivo':
            positive += 1
        elif sentimiento.lower() == 'neutral':
            neutral += 1
        elif sentimiento.lower() == 'negativo':
            negative += 1
        elif sentimiento.lower() == 'muy negativo':
            very_negative += 1

    resumen = schemas.SentimentSummary(
        total_messages=total_messages,
        very_positive=very_positive,
        positive=positive,
        neutral=neutral,
        negative=negative,
        very_negative=very_negative
    )

    cursor.close()
    return resumen

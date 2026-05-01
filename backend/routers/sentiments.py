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
from security.auth import get_current_user

router = APIRouter(
    tags=["Sentimientos"],
    prefix="/sentimientos"
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

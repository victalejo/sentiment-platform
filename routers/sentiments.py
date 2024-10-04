# routers/sentiments.py

from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Optional
from datetime import datetime

from models import schemas, models
from models.database import get_db
from utils.sentiment_analysis import analyze_sentiment
from utils.helpers import is_base64
from sqlalchemy.orm import Session
from security.auth import get_current_user

router = APIRouter()

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
    params = []

    # Aplicación de filtros
    if agent_name:
        sql += " AND agent_name = %s"
        params.append(agent_name)
    if customer_name:
        sql += " AND customer_name = %s"
        params.append(customer_name)
    if channel:
        sql += " AND channel = %s"
        params.append(channel)
    if de:
        sql += " AND de = %s"
        params.append(de)
    if date_from:
        sql += " AND date >= %s"
        params.append(date_from)
    if date_to:
        sql += " AND date <= %s"
        params.append(date_to)

    cursor = db.execute(sql, params)
    resultados = cursor.fetchall()

    mensajes_con_sentimiento = []
    for mensaje in resultados:
        texto = mensaje['message']
        if is_base64(texto):
            continue  # Ignorar mensajes en base64

        sentimiento, sentiment_score = analyze_sentiment(texto)

        # Aplicar filtro de sentimiento si se especifica
        if sentiment and sentimiento != sentiment.lower():
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
    params = []

    # Aplicación de filtros
    if agent_name:
        sql += " AND agent_name = %s"
        params.append(agent_name)
    if customer_name:
        sql += " AND customer_name = %s"
        params.append(customer_name)
    if channel:
        sql += " AND channel = %s"
        params.append(channel)
    if de:
        sql += " AND de = %s"
        params.append(de)
    if date_from:
        sql += " AND date >= %s"
        params.append(date_from)
    if date_to:
        sql += " AND date <= %s"
        params.append(date_to)

    cursor = db.execute(sql, params)
    resultados = cursor.fetchall()

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
        if sentimiento == 'muy positivo':
            very_positive += 1
        elif sentimiento == 'positivo':
            positive += 1
        elif sentimiento == 'neutral':
            neutral += 1
        elif sentimiento == 'negativo':
            negative += 1
        elif sentimiento == 'muy negativo':
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

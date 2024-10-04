from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from datetime import datetime

from models.schemas import ChatConSentimiento, SentimentSummary
from models.database import get_db_connection
from utils.sentiment_analysis import analyze_sentiment
from utils.helpers import is_base64

router = APIRouter()

@router.get("/", response_model=List[ChatConSentimiento])
def obtener_chats(
    agent_name: Optional[str] = Query(None, description="Nombre del agente"),
    customer_name: Optional[str] = Query(None, description="Nombre del cliente"),
    channel: Optional[str] = Query(None, description="Canal de comunicación"),
    de: Optional[str] = Query(None, description="Remitente del mensaje"),
    date_from: Optional[datetime] = Query(None, description="Fecha inicial"),
    date_to: Optional[datetime] = Query(None, description="Fecha final")
):
    mydb = get_db_connection()
    cursor = mydb.cursor(dictionary=True)
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

    cursor.execute(sql, params)
    resultados = cursor.fetchall()

    # Agrupar mensajes por conn_id
    chats_dict = {}
    for mensaje in resultados:
        conn_id = mensaje['conn_id']
        texto = mensaje['message']
        if is_base64(texto):
            continue  # Ignorar mensajes en base64

        if conn_id not in chats_dict:
            chats_dict[conn_id] = {
                "conn_id": conn_id,
                "agent_name": mensaje['agent_name'],
                "customer_name": mensaje['customer_name'],
                "channel": mensaje['channel'],
                "de": mensaje['de'],
                "from_name": mensaje['from_name'],
                "to_name": mensaje['to_name'],
                "date": mensaje['date'],
                "messages": [],
                "sentiment_scores": []
            }

        sentimiento, score = analyze_sentiment(texto)
        mensaje_detalle = {
            "message": texto,
            "sentiment": sentimiento,
            "sentiment_score": score,
            "date": mensaje['date'],
            "from_name": mensaje['from_name'],
            "to_name": mensaje['to_name'],
            "channel": mensaje['channel']
        }
        chats_dict[conn_id]["messages"].append(mensaje_detalle)
        chats_dict[conn_id]["sentiment_scores"].append(score)

    chats_con_sentimiento = []
    for chat in chats_dict.values():
        if not chat["sentiment_scores"]:
            continue  # Ignorar chats sin mensajes válidos

        promedio_sentimiento = sum(chat["sentiment_scores"]) / len(chat["sentiment_scores"])
        if promedio_sentimiento >= 0.5:
            sentimiento_global = 'muy positivo'
        elif promedio_sentimiento >= 0.05:
            sentimiento_global = 'positivo'
        elif promedio_sentimiento <= -0.5:
            sentimiento_global = 'muy negativo'
        elif promedio_sentimiento <= -0.05:
            sentimiento_global = 'negativo'
        else:
            sentimiento_global = 'neutral'

        chat_con_sentimiento = ChatConSentimiento(
            conn_id=chat["conn_id"],
            agent_name=chat["agent_name"],
            customer_name=chat["customer_name"],
            channel=chat["channel"],
            de=chat["de"],
            from_name=chat["from_name"],
            to_name=chat["to_name"],
            date=chat["date"],
            messages=chat["messages"],
            sentiment=sentimiento_global,
            average_sentiment_score=promedio_sentimiento
        )
        chats_con_sentimiento.append(chat_con_sentimiento)

    cursor.close()
    mydb.close()
    return chats_con_sentimiento

@router.get("/resumen", response_model=SentimentSummary)
def obtener_resumen_sentimientos_chats(
    agent_name: Optional[str] = Query(None, description="Nombre del agente"),
    customer_name: Optional[str] = Query(None, description="Nombre del cliente"),
    channel: Optional[str] = Query(None, description="Canal de comunicación"),
    de: Optional[str] = Query(None, description="Remitente del mensaje"),
    date_from: Optional[datetime] = Query(None, description="Fecha inicial"),
    date_to: Optional[datetime] = Query(None, description="Fecha final")
):
    mydb = get_db_connection()
    cursor = mydb.cursor(dictionary=True)
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

    cursor.execute(sql, params)
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

    resumen = SentimentSummary(
        total_messages=total_messages,
        very_positive=very_positive,
        positive=positive,
        neutral=neutral,
        negative=negative,
        very_negative=very_negative
    )

    cursor.close()
    mydb.close()
    return resumen

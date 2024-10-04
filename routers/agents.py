from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from datetime import datetime

from models.schemas import AgentConSentimiento, SentimentSummary
from models.database import get_db_connection
from utils.sentiment_analysis import analyze_sentiment
from utils.helpers import is_base64

router = APIRouter()

@router.get("/", response_model=List[AgentConSentimiento])
def obtener_agentes(
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

    # Agrupar mensajes por agent_name
    agentes_dict = {}
    for mensaje in resultados:
        agent = mensaje['agent_name']
        texto = mensaje['message']
        if is_base64(texto):
            continue  # Ignorar mensajes en base64

        if agent not in agentes_dict:
            agentes_dict[agent] = {
                "agent_name": agent,
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
        agentes_dict[agent]["messages"].append(mensaje_detalle)
        agentes_dict[agent]["sentiment_scores"].append(score)

    agentes_con_sentimiento = []
    for agente in agentes_dict.values():
        if not agente["sentiment_scores"]:
            continue  # Ignorar agentes sin mensajes válidos

        promedio_sentimiento = sum(agente["sentiment_scores"]) / len(agente["sentiment_scores"])
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

        agente_con_sentimiento = AgentConSentimiento(
            agent_name=agente["agent_name"],
            customer_name=agente["customer_name"],
            channel=agente["channel"],
            de=agente["de"],
            from_name=agente["from_name"],
            to_name=agente["to_name"],
            date=agente["date"],
            messages=agente["messages"],
            sentiment=sentimiento_global,
            average_sentiment_score=promedio_sentimiento
        )
        agentes_con_sentimiento.append(agente_con_sentimiento)

    cursor.close()
    mydb.close()
    return agentes_con_sentimiento

@router.get("/resumen", response_model=SentimentSummary)
def obtener_resumen_sentimientos_agentes(
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

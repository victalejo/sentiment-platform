# models/schemas.py

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional
from datetime import datetime


# Esquemas para Roles y Usuarios
class RoleBase(BaseModel):
    name: str


class RoleCreate(RoleBase):
    pass


class Role(RoleBase):
    id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str
    roles: List[str]  # Lista de nombres de roles


class User(UserBase):
    id: int
    is_active: bool
    roles: List[Role] = []

    class Config:
        from_attributes = True


# Esquemas para Tokens
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenResponse(Token):
    user: User


class TokenData(BaseModel):
    username: Optional[str] = None


# Esquemas existentes para Conversaciones
class MensajeConSentimiento(BaseModel):
    conn_id: str
    agent_name: str
    customer_name: str
    channel: str
    de: str
    from_name: str
    to_name: str
    date: datetime
    message: str
    sentiment: str
    sentiment_score: float


class SentimentSummary(BaseModel):
    total_messages: int
    very_positive: int
    positive: int
    neutral: int
    negative: int
    very_negative: int


# Esquemas para el Historial de Análisis de Sentimiento
class AnalisisRequest(BaseModel):
    """Cuerpo de la petición para analizar y persistir un texto."""
    texto: str = Field(..., min_length=1, max_length=5000,
                       description="Texto a analizar (1-5000 caracteres)")

    @field_validator("texto")
    @classmethod
    def texto_no_vacio(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("El texto no puede estar vacío.")
        return v.strip()


class AnalisisHistorial(BaseModel):
    """Representación de un análisis persistido."""
    id: int
    texto: str
    sentiment: str
    sentiment_score: float
    created_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MensajeDetalle(BaseModel):
    message: str
    sentiment: str
    sentiment_score: float
    date: datetime
    from_name: str
    to_name: str
    channel: str


class ChatConSentimiento(BaseModel):
    conn_id: str
    agent_name: str
    customer_name: str
    channel: str
    de: str
    from_name: str
    to_name: str
    date: datetime
    messages: List[MensajeDetalle]
    sentiment: str
    average_sentiment_score: float


class MensajeAgenteDetalle(BaseModel):
    message: str
    sentiment: str
    sentiment_score: float
    date: datetime
    from_name: str
    to_name: str
    channel: str


class AgentConSentimiento(BaseModel):
    agent_name: str
    customer_name: str
    channel: str
    de: str
    from_name: str
    to_name: str
    date: datetime
    messages: List[MensajeAgenteDetalle]
    sentiment: str
    average_sentiment_score: float

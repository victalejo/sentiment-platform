from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional


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

class TokenData(BaseModel):
    username: Optional[str] = None

# Esquemas para Login
class Login(BaseModel):
    username: str
    password: str


# Modelo para los mensajes con sentimiento
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

# Modelo para el resumen de sentimientos
class SentimentSummary(BaseModel):
    total_messages: int
    very_positive: int
    positive: int
    neutral: int
    negative: int
    very_negative: int

# Modelo para mensajes dentro de un chat
class MensajeDetalle(BaseModel):
    message: str
    sentiment: str
    sentiment_score: float
    date: datetime
    from_name: str
    to_name: str
    channel: str

# Modelo para chats con sentimiento
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

# Modelo para mensajes dentro de un agente
class MensajeAgenteDetalle(BaseModel):
    message: str
    sentiment: str
    sentiment_score: float
    date: datetime
    from_name: str
    to_name: str
    channel: str

# Modelo para agentes con sentimiento
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

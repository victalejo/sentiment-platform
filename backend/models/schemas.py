# models/schemas.py

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
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


class SentimentAnalysisCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value):
        normalized_text = value.strip()
        if not normalized_text:
            raise ValueError("El texto no puede estar vacio")
        return normalized_text


class SentimentAnalysisHistory(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    sentiment: str
    sentiment_score: float
    created_at: datetime
    created_by_user_id: Optional[int] = None


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

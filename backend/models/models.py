# models/models.py

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship
from models.database import Base

# Tabla asociativa para la relación muchos a muchos entre usuarios y roles
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True)
)


class Role(Base):
    __tablename__ = 'roles'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    def __repr__(self):
        return f"<Role(name={self.name})>"


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    roles = relationship("Role", secondary=user_roles, backref="users")

    def __repr__(self):
        return f"<User(username={self.username}, email={self.email})>"


class SentimentAnalysisHistory(Base):
    __tablename__ = 'sentiment_analysis_history'

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    sentiment = Column(String(50), nullable=False, index=True)
    sentiment_score = Column(Float, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    created_by_user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)

    created_by_user = relationship("User", backref="sentiment_analysis_history")

    def __repr__(self):
        return f"<SentimentAnalysisHistory(id={self.id}, sentiment={self.sentiment})>"

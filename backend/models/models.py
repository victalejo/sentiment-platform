# models/models.py

from sqlalchemy import Column, Integer, String, Boolean, Table, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
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


class SentimentHistory(Base):
    __tablename__ = 'sentiment_history'

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(4000), nullable=False)
    sentiment = Column(String(50), nullable=False)
    sentiment_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SentimentHistory(id={self.id}, sentiment={self.sentiment}, created_at={self.created_at})>"

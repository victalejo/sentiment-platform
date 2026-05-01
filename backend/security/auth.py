# security/auth.py

from fastapi import Depends, HTTPException, status
from models import models
from sqlalchemy.orm import Session
from models.database import get_db
from security.jwt import decode_access_token
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    token_data = decode_access_token(token)
    if token_data is None or token_data.username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if not any(role.name == "admin" for role in current_user.roles):
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    return current_user

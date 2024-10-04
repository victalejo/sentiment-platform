# routers/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import schemas, models
from models.database import get_db
from security import jwt
from typing import List
from security.auth import get_current_user
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(
    tags=["Usuarios"],
    prefix="/users"
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
               current_user: models.User = Depends(get_current_user)):
    # Verificar que el usuario actual tenga rol de admin
    if not any(role.name == "admin" for role in current_user.roles):
        raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción")

    users = db.query(models.User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verificar que el usuario actual tenga rol de admin
    if not any(role.name == "admin" for role in current_user.roles):
        raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verificar que el usuario actual tenga rol de admin
    if not any(role.name == "admin" for role in current_user.roles):
        raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
    return

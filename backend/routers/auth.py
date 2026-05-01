# routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from models import schemas, models
from models.database import get_db
from security import jwt, password
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from security.auth import get_current_user

router = APIRouter(
    tags=["Autenticación"],
    prefix="/auth"
)


def get_user(db: Session, identifier: str):
    return db.query(models.User).options(joinedload(models.User.roles)).filter(
        (models.User.username == identifier) |
        (models.User.email == identifier)
    ).first()


def authenticate_user(db: Session, identifier: str, plain_password: str):
    user = get_user(db, identifier)
    if not user:
        return False
    if not password.verify_password(plain_password, user.hashed_password):
        return False
    return user


@router.post("/login", response_model=schemas.TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=jwt.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user)):
    # Verificar que el usuario actual tenga rol de admin
    if not any(role.name == "admin" for role in current_user.roles):
        raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción")

    db_user = db.query(models.User).filter(
        (models.User.username == user.username) |
        (models.User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    hashed_password = password.hash_password(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    # Asignar roles
    roles = db.query(models.Role).filter(models.Role.name.in_(user.roles)).all()
    if not roles:
        raise HTTPException(status_code=400, detail="Roles no válidos")
    new_user.roles = roles
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

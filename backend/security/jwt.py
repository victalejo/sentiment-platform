# security/jwt.py

import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from models.schemas import TokenData

# Configuraciones para JWT.
# SECRET_KEY se lee de la variable de entorno SECRET_KEY; el valor por defecto
# se mantiene como fallback para no romper entornos existentes, pero en
# producción DEBE definirse mediante variable de entorno (ver .env.example).
SECRET_KEY = os.getenv("SECRET_KEY", "TU_SECRETO_MUY_SEGURO")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        token_data = TokenData(username=username)
        return token_data
    except JWTError:
        return None

---

# 📚 Documentación de Autenticación para la API de Análisis de Sentimientos

## 🔍 **Índice**

1. [Introducción](#introducción)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Arquitectura de Autenticación](#arquitectura-de-autenticación)
4. [Modelos y Esquemas](#modelos-y-esquemas)
5. [Endpoints de Autenticación](#endpoints-de-autenticación)
   - [1. Login (`POST /auth/login`)](#1-login-post-authlogin)
   - [2. Obtener Información del Usuario (`GET /auth/me`)](#2-obtener-información-del-usuario-get-authme)
   - [3. Crear Usuario (`POST /auth/users/`)](#3-crear-usuario-post-authusers)
6. [Manejo de Roles](#manejo-de-roles)
7. [Protección de Endpoints](#protección-de-endpoints)
8. [Ejemplos de Uso](#ejemplos-de-uso)
   - [1. Iniciar Sesión](#1-iniciar-sesión)
   - [2. Obtener Información del Usuario](#2-obtener-información-del-usuario)
   - [3. Crear un Nuevo Usuario](#3-crear-un-nuevo-usuario)
9. [Manejo de Errores](#manejo-de-errores)
10. [Buenas Prácticas](#buenas-prácticas)
11. [Conclusión](#conclusión)

---

## 👋 **1. Introducción**

La autenticación es un componente esencial en cualquier API que maneja información sensible o que requiere control de acceso basado en usuarios y roles. En esta documentación, se detalla cómo está implementada la autenticación en la **API de Análisis de Sentimientos** utilizando **FastAPI**, **JWT (JSON Web Tokens)** y **SQLAlchemy** para la gestión de usuarios y roles.

---

## 🛠️ **2. Tecnologías Utilizadas**

- **FastAPI**: Framework web moderno y rápido para construir APIs con Python 3.6+.
- **JWT (JSON Web Tokens)**: Estándar abierto para crear tokens de acceso seguros.
- **SQLAlchemy**: ORM (Object-Relational Mapping) para interactuar con la base de datos.
- **Pydantic**: Validación y serialización de datos.
- **Nltk**: Biblioteca para el procesamiento del lenguaje natural, utilizada aquí para análisis de sentimientos.
- **Uvicorn**: Servidor ASGI para servir la aplicación FastAPI.

---

## 🏗️ **3. Arquitectura de Autenticación**

La autenticación en la API se basa en **OAuth2 con Password Flow** utilizando tokens JWT. Los usuarios pueden iniciar sesión proporcionando sus credenciales, recibir un token de acceso y utilizarlo para acceder a endpoints protegidos. Además, se implementa un sistema de roles que permite controlar el acceso a ciertos recursos según los permisos del usuario.

---

## 🧩 **4. Modelos y Esquemas**

### **a. Modelos de SQLAlchemy (`models/models.py`)**

```python
from sqlalchemy import Column, Integer, String, Boolean, Table, ForeignKey
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
```

### **b. Esquemas de Pydantic (`models/schemas.py`)**

```python
from pydantic import BaseModel, EmailStr
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
        orm_mode = True

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
        orm_mode = True

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
```

**Notas:**

- **`orm_mode = True`**: Permite que Pydantic convierta automáticamente objetos ORM en diccionarios compatibles.
- **Relaciones**: Los esquemas de usuarios incluyen una lista de roles asociados.

---

## 🔑 **5. Endpoints de Autenticación**

### 1. **Login (`POST /auth/login`)**

**Descripción:**
Permite a un usuario autenticarse proporcionando su nombre de usuario (o correo electrónico) y contraseña. Devuelve un token JWT de acceso y la información del usuario, incluyendo sus roles.

**URL:**
```
POST /auth/login
```

**Request Body:**
- **Content-Type:** `application/x-www-form-urlencoded`
- **Campos:**
  - `username`: `string` (puede ser el nombre de usuario o el correo electrónico)
  - `password`: `string`

**Ejemplo de Solicitud con cURL:**
```bash
curl -X POST "http://127.0.0.1:8002/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin&password=adminpassword"
```

**Respuesta Exitosa (`200 OK`):**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
        "username": "admin",
        "email": "admin@example.com",
        "id": 1,
        "is_active": true,
        "roles": [
            {
                "id": 1,
                "name": "admin"
            }
        ]
    }
}
```

**Posibles Errores:**

- **`401 Unauthorized`**: Credenciales inválidas.
  ```json
  {
      "detail": "Credenciales inválidas"
  }
  ```
- **`400 Bad Request`**: Campos faltantes o mal formateados.

---

### 2. **Obtener Información del Usuario (`GET /auth/me`)**

**Descripción:**
Devuelve la información detallada del usuario autenticado, incluyendo sus roles. Este endpoint está protegido y requiere un token JWT válido.

**URL:**
```
GET /auth/me
```

**Headers:**
- `Authorization`: `Bearer <access_token>`

**Ejemplo de Solicitud con cURL:**
```bash
curl -X GET "http://127.0.0.1:8002/auth/me" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta Exitosa (`200 OK`):**
```json
{
    "username": "admin",
    "email": "admin@example.com",
    "id": 1,
    "is_active": true,
    "roles": [
        {
            "id": 1,
            "name": "admin"
        }
    ]
}
```

**Posibles Errores:**

- **`401 Unauthorized`**: Token inválido o expirado.
  ```json
  {
      "detail": "No hay una autenticación de credenciales válidas para la solicitud."
  }
  ```

---

### 3. **Crear Usuario (`POST /auth/users/`)**

**Descripción:**
Permite crear un nuevo usuario en la base de datos. Este endpoint está protegido y requiere que el usuario actual tenga el rol de `admin`.

**URL:**
```
POST /auth/users/
```

**Headers:**
- `Authorization`: `Bearer <access_token>`

**Request Body:**
- **Content-Type:** `application/json`
- **Campos:**
  - `username`: `string`
  - `email`: `EmailStr`
  - `password`: `string`
  - `roles`: `List[str]` (lista de nombres de roles a asignar)

**Ejemplo de Solicitud con cURL:**
```bash
curl -X POST "http://127.0.0.1:8002/auth/users/" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     -H "Content-Type: application/json" \
     -d '{
           "username": "nuevo_usuario",
           "email": "nuevo@example.com",
           "password": "contraseña_segura",
           "roles": ["user"]
         }'
```

**Respuesta Exitosa (`200 OK`):**
```json
{
    "username": "nuevo_usuario",
    "email": "nuevo@example.com",
    "id": 2,
    "is_active": true,
    "roles": [
        {
            "id": 2,
            "name": "user"
        }
    ]
}
```

**Posibles Errores:**

- **`403 Forbidden`**: El usuario actual no tiene permisos de `admin`.
  ```json
  {
      "detail": "No tienes permisos para realizar esta acción"
  }
  ```
- **`400 Bad Request`**: El usuario ya existe o los roles proporcionados no son válidos.
  ```json
  {
      "detail": "El usuario ya existe"
  }
  ```
  ```json
  {
      "detail": "Roles no válidos"
  }
  ```

---

## 🔒 **6. Manejo de Roles**

Los roles permiten definir permisos y controlar el acceso a diferentes partes de la API. En este proyecto, se definen principalmente dos roles:

- **`admin`**: Usuarios con este rol tienen permisos completos, incluyendo la creación de otros usuarios.
- **`user`**: Usuarios estándar con permisos limitados.

### **a. Definición de Roles en la Base de Datos**

Los roles se almacenan en la tabla `roles` y se relacionan con los usuarios a través de la tabla asociativa `user_roles`.

### **b. Asignación de Roles al Crear Usuarios**

Al crear un nuevo usuario, se pueden asignar uno o más roles especificando una lista de nombres de roles en el campo `roles` del cuerpo de la solicitud.

**Ejemplo de Asignación de Roles:**
```json
{
    "username": "usuario_ejemplo",
    "email": "usuario@ejemplo.com",
    "password": "contraseña_segura",
    "roles": ["user"]
}
```

### **c. Verificación de Roles en Endpoints Protegidos**

Para proteger endpoints específicos, se verifica si el usuario autenticado posee los roles necesarios.

**Ejemplo de Verificación de Rol en un Endpoint:**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import schemas, models
from models.database import get_db
from security.auth import get_current_user

router = APIRouter(
    tags=["Protegido"],
    prefix="/protegido"
)

@router.get("/admin-only", response_model=schemas.SomeData)
def admin_only_endpoint(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not any(role.name == "admin" for role in current_user.roles):
        raise HTTPException(status_code=403, detail="No tienes permisos para acceder a este recurso")
    
    # Lógica del endpoint para administradores
    data = db.query(models.SomeModel).all()
    return data
```

---

## 🔐 **7. Protección de Endpoints**

Para proteger los endpoints y asegurar que solo usuarios autenticados y autorizados puedan acceder a ellos, se utilizan **dependencias** en FastAPI que verifican la validez del token y los roles del usuario.

### **a. Dependencia para Obtener el Usuario Actual**

Esta dependencia extrae y valida el token JWT, y retorna el usuario autenticado.

**Ejemplo de Implementación (`security/auth.py`):**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from models import models, schemas
from models.database import get_db
from security import jwt as jwt_utils

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No hay una autenticación de credenciales válidas para la solicitud.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt_utils.decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).options(joinedload(models.User.roles)).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user
```

**Notas:**

- **`oauth2_scheme`**: Define el esquema de seguridad para OAuth2.
- **`get_current_user`**: Decodifica el token, obtiene el nombre de usuario y recupera al usuario de la base de datos, incluyendo sus roles.

### **b. Uso de Dependencias en Endpoints**

Al proteger un endpoint, simplemente incluye la dependencia `get_current_user` y verifica los roles según sea necesario.

**Ejemplo:**
```python
@router.get("/datos-protegidos", response_model=schemas.DatosProtegidos)
def obtener_datos_protegidos(current_user: models.User = Depends(get_current_user)):
    # Verificar rol si es necesario
    if not any(role.name == "admin" for role in current_user.roles):
        raise HTTPException(status_code=403, detail="No tienes permisos para acceder a este recurso")
    
    # Lógica del endpoint
    datos = ... # Obtener datos protegidos
    return datos
```

---

## 📝 **8. Ejemplos de Uso**

### 1. **Iniciar Sesión**

**Descripción:**
Autentica a un usuario y obtiene un token de acceso.

**Solicitud con cURL:**
```bash
curl -X POST "http://127.0.0.1:8002/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin&password=adminpassword"
```

**Respuesta Exitosa:**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
        "username": "admin",
        "email": "admin@example.com",
        "id": 1,
        "is_active": true,
        "roles": [
            {
                "id": 1,
                "name": "admin"
            }
        ]
    }
}
```

### 2. **Obtener Información del Usuario**

**Descripción:**
Obtiene la información detallada del usuario autenticado, incluyendo sus roles.

**Solicitud con cURL:**
```bash
curl -X GET "http://127.0.0.1:8002/auth/me" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta Exitosa:**
```json
{
    "username": "admin",
    "email": "admin@example.com",
    "id": 1,
    "is_active": true,
    "roles": [
        {
            "id": 1,
            "name": "admin"
        }
    ]
}
```

### 3. **Crear un Nuevo Usuario**

**Descripción:**
Crea un nuevo usuario y le asigna roles específicos. Solo usuarios con el rol `admin` pueden realizar esta acción.

**Solicitud con cURL:**
```bash
curl -X POST "http://127.0.0.1:8002/auth/users/" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     -H "Content-Type: application/json" \
     -d '{
           "username": "nuevo_usuario",
           "email": "nuevo@example.com",
           "password": "contraseña_segura",
           "roles": ["user"]
         }'
```

**Respuesta Exitosa:**
```json
{
    "username": "nuevo_usuario",
    "email": "nuevo@example.com",
    "id": 2,
    "is_active": true,
    "roles": [
        {
            "id": 2,
            "name": "user"
        }
    ]
}
```

---

## 🛡️ **9. Manejo de Errores**

La API maneja los errores de manera consistente, retornando mensajes claros y códigos de estado HTTP adecuados.

### **Errores Comunes:**

- **`401 Unauthorized`**: Token inválido o credenciales incorrectas.
- **`403 Forbidden`**: Acceso denegado debido a permisos insuficientes.
- **`400 Bad Request`**: Datos de entrada inválidos o usuario ya existente.
- **`500 Internal Server Error`**: Errores inesperados en el servidor.

### **Ejemplo de Respuesta de Error:**

```json
{
    "detail": "Credenciales inválidas"
}
```

---

## 💡 **10. Buenas Prácticas**

- **Almacenamiento Seguro de Tokens**: Guarda los tokens JWT de manera segura en el cliente, preferiblemente en `httpOnly` cookies para prevenir ataques XSS.
- **Uso de HTTPS**: Siempre utiliza HTTPS para proteger las comunicaciones entre el cliente y el servidor.
- **Rotación de Tokens**: Implementa mecanismos para renovar tokens y gestionar su expiración de manera efectiva.
- **Control de Acceso Basado en Roles**: Define claramente los roles y sus permisos asociados, y utiliza decoradores o dependencias para verificar permisos en los endpoints.
- **Validación de Datos**: Utiliza Pydantic para validar y sanitizar todos los datos de entrada.
- **Manejo de Contraseñas Seguras**: Almacena las contraseñas de manera segura utilizando algoritmos de hashing robustos como bcrypt.
- **Registro y Monitoreo**: Implementa un sistema de logging y monitoreo para detectar y responder a actividades sospechosas.

---

## 🎯 **11. Conclusión**

La autenticación es una pieza clave para asegurar tu API y controlar el acceso a sus recursos. Esta documentación ha cubierto la implementación de un sistema de autenticación robusto utilizando FastAPI, JWT y SQLAlchemy, incluyendo la gestión de roles y la protección de endpoints. Al seguir las prácticas recomendadas y mantener una estructura clara en tus modelos y esquemas, podrás mantener tu API segura y eficiente.

**Recuerda siempre mantener actualizadas las dependencias y seguir las mejores prácticas de seguridad para proteger tanto a tus usuarios como a tus datos.**

---

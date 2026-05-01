# security/roles.py

from fastapi import Depends, HTTPException, status
from models import models
from sqlalchemy.orm import Session
from models.database import get_db
from security.auth import get_current_user

def require_role(role: str):
    def role_dependency(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
        if not any(r.name == role for r in current_user.roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes los permisos necesarios",
            )
        return current_user
    return role_dependency

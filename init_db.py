# init_db.py

from sqlalchemy.orm import Session
from models import models, schemas
from models.database import SessionLocal, engine
from security import password


def init_roles(db: Session):
    roles = ["admin", "user"]
    for role_name in roles:
        role = db.query(models.Role).filter(models.Role.name == role_name).first()
        if not role:
            role = models.Role(name=role_name)
            db.add(role)
    db.commit()


def init_admin(db: Session):
    admin_username = "admin"
    admin_email = "admin@iaportafolio.com"
    admin_password = "Alejo2024"  # Cambia esto por una contraseña segura

    user = db.query(models.User).filter(
        (models.User.username == admin_username) | (models.User.email == admin_email)).first()
    if not user:
        hashed_password = password.hash_password(admin_password)
        user = models.User(username=admin_username, email=admin_email, hashed_password=hashed_password)
        admin_role = db.query(models.Role).filter(models.Role.name == "admin").first()
        user.roles.append(admin_role)
        db.add(user)
        db.commit()
        print("Usuario administrador creado.")
    else:
        print("El usuario administrador ya existe.")


def main():
    db = SessionLocal()
    try:
        init_roles(db)
        init_admin(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()

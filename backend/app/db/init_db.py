from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app import models  # noqa: F401
from app.core.config import settings
from app.core.security import hash_password


def init_db() -> None:
    Base.metadata.create_all(bind=engine)

    if not settings.admin_username or not settings.admin_password:
        return

    db: Session = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.username == settings.admin_username).first()
        if existing:
            return
        raw_password = settings.admin_password.strip()
        if not raw_password:
            return
        # bcrypt max password length is 72 bytes; truncate by bytes to avoid crash
        raw_bytes = raw_password.encode("utf-8")
        if len(raw_bytes) > 72:
            safe_password = "admin"
        else:
            safe_password = raw_bytes[:72].decode("utf-8", errors="ignore")
        admin_user = models.User(
            username=settings.admin_username,
            email=settings.admin_email or f"{settings.admin_username}@example.com",
            password_hash=hash_password(safe_password),
            role="admin",
        )
        db.add(admin_user)
        db.commit()
    finally:
        db.close()

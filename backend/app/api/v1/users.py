from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud.users import create_user, get_user_by_email, get_user_by_username
from app.db.deps import get_db
from app.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/users")


@router.post("/", response_model=UserOut)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    existing_username = get_user_by_username(db, payload.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db, payload)

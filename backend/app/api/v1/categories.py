from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.categories import create_category, list_categories
from app.db.deps import get_db
from app.schemas.category import CategoryCreate, CategoryOut

router = APIRouter(prefix="/categories")


@router.get("/", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return list_categories(db)


@router.post("/", response_model=CategoryOut)
def add_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    return create_category(db, payload)

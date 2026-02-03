from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.tags import create_tag, list_tags
from app.db.deps import get_db
from app.schemas.tag import TagCreate, TagOut

router = APIRouter(prefix="/tags")


@router.get("/", response_model=list[TagOut])
def get_tags(db: Session = Depends(get_db)):
    return list_tags(db)


@router.post("/", response_model=TagOut)
def add_tag(payload: TagCreate, db: Session = Depends(get_db)):
    return create_tag(db, payload)

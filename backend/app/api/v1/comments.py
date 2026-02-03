from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.comments import create_comment, list_comments_for_post
from app.db.deps import get_db
from app.schemas.comment import CommentCreate, CommentOut

router = APIRouter(prefix="/comments")


@router.get("/", response_model=list[CommentOut])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    return list_comments_for_post(db, post_id)


@router.post("/", response_model=CommentOut)
def add_comment(payload: CommentCreate, db: Session = Depends(get_db)):
    return create_comment(db, payload)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud.comments import (
    create_comment,
    delete_comment,
    get_comment,
    list_comments_for_post,
)
from app.db.deps import get_db
from app.schemas.comment import CommentCreate, CommentOut

router = APIRouter(prefix="/comments")


@router.get("/", response_model=list[CommentOut])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    return list_comments_for_post(db, post_id)


@router.post("/", response_model=CommentOut)
def add_comment(
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_comment(db, payload, author_id=current_user.id)


@router.delete("/{comment_id}")
def remove_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    comment = get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if current_user.role != "admin" and comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    delete_comment(db, comment)
    return {"ok": True}

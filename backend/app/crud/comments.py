from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.schemas.comment import CommentCreate


def create_comment(db: Session, comment_in: CommentCreate) -> Comment:
    comment = Comment(
        post_id=comment_in.post_id,
        author_id=comment_in.author_id,
        content=comment_in.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def list_comments_for_post(db: Session, post_id: int) -> list[Comment]:
    return (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.id.desc())
        .all()
    )

from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.schemas.comment import CommentCreate


def create_comment(db: Session, comment_in: CommentCreate, author_id: int) -> Comment:
    comment = Comment(
        post_id=comment_in.post_id,
        author_id=author_id,
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


def get_comment(db: Session, comment_id: int) -> Comment | None:
    return db.query(Comment).filter(Comment.id == comment_id).first()


def delete_comment(db: Session, comment: Comment) -> None:
    db.delete(comment)
    db.commit()

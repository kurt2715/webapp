from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.tag import Tag
from app.schemas.post import PostCreate, PostUpdate


def create_post(db: Session, post_in: PostCreate) -> Post:
    post = Post(
        title=post_in.title,
        body=post_in.body,
        summary=post_in.summary,
        author_id=post_in.author_id,
        category_id=post_in.category_id,
        published_at=post_in.published_at,
    )
    if post_in.tag_ids:
        post.tags = db.query(Tag).filter(Tag.id.in_(post_in.tag_ids)).all()
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def get_post(db: Session, post_id: int) -> Post | None:
    return db.query(Post).filter(Post.id == post_id).first()


def list_posts(db: Session) -> list[Post]:
    return db.query(Post).order_by(Post.id.desc()).all()


def update_post(db: Session, post: Post, post_in: PostUpdate) -> Post:
    data = post_in.model_dump(exclude_unset=True)
    tag_ids = data.pop("tag_ids", None)
    for field, value in data.items():
        setattr(post, field, value)
    if tag_ids is not None:
        post.tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def delete_post(db: Session, post: Post) -> None:
    db.delete(post)
    db.commit()

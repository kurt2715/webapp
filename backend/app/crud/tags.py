from sqlalchemy.orm import Session

from app.models.tag import Tag
from app.schemas.tag import TagCreate


def create_tag(db: Session, tag_in: TagCreate) -> Tag:
    tag = Tag(name=tag_in.name, slug=tag_in.slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def list_tags(db: Session) -> list[Tag]:
    return db.query(Tag).order_by(Tag.id.desc()).all()

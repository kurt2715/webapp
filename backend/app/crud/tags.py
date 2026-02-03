from sqlalchemy.orm import Session

from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate


def create_tag(db: Session, tag_in: TagCreate) -> Tag:
    tag = Tag(name=tag_in.name, slug=tag_in.slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def list_tags(db: Session) -> list[Tag]:
    return db.query(Tag).order_by(Tag.id.desc()).all()


def get_tag(db: Session, tag_id: int) -> Tag | None:
    return db.query(Tag).filter(Tag.id == tag_id).first()


def update_tag(db: Session, tag: Tag, payload: TagUpdate) -> Tag:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(tag, field, value)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def delete_tag(db: Session, tag: Tag) -> None:
    db.delete(tag)
    db.commit()

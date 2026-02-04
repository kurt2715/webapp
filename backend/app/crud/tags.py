from sqlalchemy.orm import Session

from app.models.tag import Tag
import re

from app.schemas.tag import TagCreate, TagUpdate


def _slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"\\s+", "-", value)
    value = re.sub(r"[^a-z0-9\\-]", "", value)
    return value or "tag"


def create_tag(db: Session, tag_in: TagCreate) -> Tag:
    slug = tag_in.slug or _slugify(tag_in.name)
    tag = Tag(name=tag_in.name, slug=slug)
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
    if "name" in data and "slug" not in data:
        data["slug"] = _slugify(data["name"])
    for field, value in data.items():
        setattr(tag, field, value)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def delete_tag(db: Session, tag: Tag) -> None:
    db.delete(tag)
    db.commit()

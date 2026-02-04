from sqlalchemy.orm import Session

from app.models.category import Category
import re

from app.schemas.category import CategoryCreate, CategoryUpdate


def _slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"\\s+", "-", value)
    value = re.sub(r"[^a-z0-9\\-]", "", value)
    return value or "category"


def create_category(db: Session, category_in: CategoryCreate) -> Category:
    slug = category_in.slug or _slugify(category_in.name)
    category = Category(name=category_in.name, slug=slug)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def list_categories(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.id.desc()).all()


def get_category(db: Session, category_id: int) -> Category | None:
    return db.query(Category).filter(Category.id == category_id).first()


def update_category(db: Session, category: Category, payload: CategoryUpdate) -> Category:
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and "slug" not in data:
        data["slug"] = _slugify(data["name"])
    for field, value in data.items():
        setattr(category, field, value)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: Category) -> None:
    db.delete(category)
    db.commit()

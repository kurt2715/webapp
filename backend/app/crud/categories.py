from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate


def create_category(db: Session, category_in: CategoryCreate) -> Category:
    category = Category(name=category_in.name, slug=category_in.slug)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def list_categories(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.id.desc()).all()

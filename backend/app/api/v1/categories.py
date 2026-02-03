from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.crud.categories import (
    create_category,
    delete_category,
    get_category,
    list_categories,
    update_category,
)
from app.db.deps import get_db
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate

router = APIRouter(prefix="/categories")


@router.get("/", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return list_categories(db)


@router.post("/", response_model=CategoryOut)
def add_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return create_category(db, payload)


@router.put("/{category_id}", response_model=CategoryOut)
def edit_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    category = get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return update_category(db, category, payload)


@router.delete("/{category_id}")
def remove_category(
    category_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    category = get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    delete_category(db, category)
    return {"ok": True}

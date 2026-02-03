from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.crud.tags import create_tag, delete_tag, get_tag, list_tags, update_tag
from app.db.deps import get_db
from app.schemas.tag import TagCreate, TagOut, TagUpdate

router = APIRouter(prefix="/tags")


@router.get("/", response_model=list[TagOut])
def get_tags(db: Session = Depends(get_db)):
    return list_tags(db)


@router.post("/", response_model=TagOut)
def add_tag(
    payload: TagCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return create_tag(db, payload)


@router.put("/{tag_id}", response_model=TagOut)
def edit_tag(
    tag_id: int,
    payload: TagUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    tag = get_tag(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return update_tag(db, tag, payload)


@router.delete("/{tag_id}")
def remove_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    tag = get_tag(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    delete_tag(db, tag)
    return {"ok": True}

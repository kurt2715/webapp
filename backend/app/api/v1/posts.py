from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud.posts import create_post, delete_post, get_post, list_posts, update_post
from app.db.deps import get_db
from app.schemas.post import PostCreate, PostOut, PostUpdate

router = APIRouter(prefix="/posts")


@router.get("/", response_model=list[PostOut])
def get_posts(db: Session = Depends(get_db)):
    return list_posts(db)


@router.get("/{post_id}", response_model=PostOut)
def get_post_detail(post_id: int, db: Session = Depends(get_db)):
    post = get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/", response_model=PostOut)
def add_post(
    payload: PostCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_post(db, payload, author_id=current_user.id)


@router.put("/{post_id}", response_model=PostOut)
def edit_post(
    post_id: int,
    payload: PostUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    post = get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if current_user.role != "admin" and post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return update_post(db, post, payload)


@router.delete("/{post_id}")
def remove_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    post = get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if current_user.role != "admin" and post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    delete_post(db, post)
    return {"ok": True}

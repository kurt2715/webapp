from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class PostBase(BaseModel):
    title: str
    body: str
    summary: Optional[str] = None
    author_id: int
    category_id: Optional[int] = None
    tag_ids: List[int] = []
    published_at: Optional[datetime] = None


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    summary: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    published_at: Optional[datetime] = None


class PostOut(PostBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

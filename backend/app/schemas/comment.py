from pydantic import BaseModel, ConfigDict


class CommentBase(BaseModel):
    post_id: int
    author_id: int
    content: str


class CommentCreate(CommentBase):
    pass


class CommentOut(CommentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

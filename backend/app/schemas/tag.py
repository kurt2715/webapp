from pydantic import BaseModel, ConfigDict


class TagBase(BaseModel):
    name: str
    slug: str


class TagCreate(TagBase):
    pass


class TagOut(TagBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

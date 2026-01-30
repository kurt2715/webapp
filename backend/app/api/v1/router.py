from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


api_router = APIRouter()
api_router.include_router(router, tags=["health"])

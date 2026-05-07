from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.product_repository import ProductRepository
from app.services.product_service import ProductService
from app.schemas.product import ProductListResponse, ProductResponse

router = APIRouter(prefix="/api/products", tags=["Products"])


def _get_service(db: AsyncSession = Depends(get_db)) -> ProductService:
    return ProductService(ProductRepository(db))


@router.get("/", response_model=ProductListResponse, summary="Список товаров")
async def get_products(
    request: Request,
    category: str | None = Query(None, description="Фильтр по категории"),
    min_price: float | None = Query(None, ge=0, description="Минимальная цена"),
    max_price: float | None = Query(None, ge=0, description="Максимальная цена"),
    search: str | None = Query(None, description="Поиск по названию и описанию"),
    sort_by: str = Query("id", pattern="^(id|name|price)$", description="Поле сортировки"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$", description="Направление сортировки"),
    limit: int = Query(20, ge=1, le=100, description="Количество записей"),
    offset: int = Query(0, ge=0, description="Смещение"),
    service: ProductService = Depends(_get_service),
):
    return await service.get_products(
        request=request,
        category=category,
        min_price=min_price,
        max_price=max_price,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        limit=limit,
        offset=offset,
    )


@router.get("/{product_id}/", response_model=ProductResponse, summary="Детали товара")
async def get_product(
    product_id: int,
    service: ProductService = Depends(_get_service),
):
    product = await service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product

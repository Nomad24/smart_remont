from fastapi import Request

from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductListResponse, ProductResponse

ALLOWED_SORT_FIELDS = {"id", "name", "price"}


class ProductService:
    def __init__(self, repo: ProductRepository):
        self._repo = repo

    async def get_products(
        self,
        request: Request,
        category: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        search: str | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
        limit: int = 20,
        offset: int = 0,
    ) -> ProductListResponse:
        if sort_by not in ALLOWED_SORT_FIELDS:
            sort_by = "id"
        if sort_order.lower() not in ("asc", "desc"):
            sort_order = "asc"

        total, products = await self._repo.get_list(
            category=category,
            min_price=min_price,
            max_price=max_price,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
            limit=limit,
            offset=offset,
        )

        base_url = str(request.base_url).rstrip("/")
        path = request.url.path

        next_url = None
        previous_url = None

        if offset + limit < total:
            next_url = f"{base_url}{path}?limit={limit}&offset={offset + limit}"

        if offset > 0:
            previous_url = f"{base_url}{path}?limit={limit}&offset={max(0, offset - limit)}"

        return ProductListResponse(
            count=total,
            next=next_url,
            previous=previous_url,
            results=[ProductResponse.model_validate(p) for p in products],
        )

    async def get_product(self, product_id: int) -> ProductResponse | None:
        product = await self._repo.get_by_id(product_id)
        if not product:
            return None
        return ProductResponse.model_validate(product)

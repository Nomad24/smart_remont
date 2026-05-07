from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.models.product import Product


class ProductRepository:
    def __init__(self, db: AsyncSession):
        self._db = db

    async def get_list(
        self,
        category: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        search: str | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[int, list[Product]]:
        query = select(Product)
        count_query = select(func.count(Product.id))

        if category:
            query = query.where(Product.category == category)
            count_query = count_query.where(Product.category == category)

        if min_price is not None:
            query = query.where(Product.price >= min_price)
            count_query = count_query.where(Product.price >= min_price)

        if max_price is not None:
            query = query.where(Product.price <= max_price)
            count_query = count_query.where(Product.price <= max_price)

        if search:
            search_filter = or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        sort_column = getattr(Product, sort_by, Product.id)
        if sort_order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        total = await self._db.scalar(count_query)
        result = await self._db.execute(query.limit(limit).offset(offset))
        products = result.scalars().all()

        return total or 0, list(products)

    async def get_by_id(self, product_id: int) -> Product | None:
        return await self._db.get(Product, product_id)

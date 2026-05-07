from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.cart import Cart, CartItem


class CartRepository:
    def __init__(self, db: AsyncSession):
        self._db = db

    async def get_or_create_cart(self, session_id: str) -> Cart:
        cart = await self._get_cart_by_session(session_id)
        if cart:
            return cart

        cart = Cart(session_id=session_id)
        self._db.add(cart)
        await self._db.commit()
        await self._db.refresh(cart)
        return cart

    async def get_cart_with_items(self, session_id: str) -> Cart | None:
        return await self._get_cart_by_session(session_id)

    async def _get_cart_by_session(self, session_id: str) -> Cart | None:
        result = await self._db.execute(
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .where(Cart.session_id == session_id)
        )
        return result.scalar_one_or_none()

    async def get_cart_item(self, item_id: int, session_id: str) -> CartItem | None:
        result = await self._db.execute(
            select(CartItem)
            .join(Cart)
            .options(selectinload(CartItem.product))
            .where(CartItem.id == item_id, Cart.session_id == session_id)
        )
        return result.scalar_one_or_none()

    async def add_item(self, cart: Cart, product_id: int, quantity: int) -> CartItem:
        result = await self._db.execute(
            select(CartItem)
            .options(selectinload(CartItem.product))
            .where(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.quantity += quantity
            await self._db.commit()
            await self._db.refresh(existing)
            return existing

        item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
        self._db.add(item)
        await self._db.commit()
        await self._db.refresh(item)

        result = await self._db.execute(
            select(CartItem)
            .options(selectinload(CartItem.product))
            .where(CartItem.id == item.id)
        )
        return result.scalar_one()

    async def update_item_quantity(self, item: CartItem, quantity: int) -> CartItem:
        item.quantity = quantity
        await self._db.commit()
        await self._db.refresh(item)
        return item

    async def delete_item(self, item: CartItem) -> None:
        await self._db.delete(item)
        await self._db.commit()

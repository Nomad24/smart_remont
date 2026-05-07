from decimal import Decimal

from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse
from app.schemas.product import ProductResponse


class CartService:
    def __init__(self, cart_repo: CartRepository, product_repo: ProductRepository):
        self._cart_repo = cart_repo
        self._product_repo = product_repo

    def _build_item_response(self, item) -> CartItemResponse:
        item_total = Decimal(str(item.product.price)) * item.quantity
        return CartItemResponse(
            id=item.id,
            product=ProductResponse.model_validate(item.product),
            quantity=item.quantity,
            total_price=item_total,
        )

    def _build_cart_response(self, cart) -> CartResponse:
        items = [self._build_item_response(item) for item in cart.items]
        total = sum(i.total_price for i in items)
        return CartResponse(
            id=cart.id,
            session_id=cart.session_id,
            items=items,
            total_price=total,
        )

    async def get_cart(self, session_id: str) -> CartResponse:
        cart = await self._cart_repo.get_or_create_cart(session_id)
        return self._build_cart_response(cart)

    async def add_item(self, session_id: str, data: CartItemCreate) -> CartItemResponse | None:
        product = await self._product_repo.get_by_id(data.product_id)
        if not product:
            return None

        cart = await self._cart_repo.get_or_create_cart(session_id)
        item = await self._cart_repo.add_item(cart, data.product_id, data.quantity)
        return self._build_item_response(item)

    async def update_item(
        self, session_id: str, item_id: int, data: CartItemUpdate
    ) -> CartItemResponse | None:
        item = await self._cart_repo.get_cart_item(item_id, session_id)
        if not item:
            return None

        item = await self._cart_repo.update_item_quantity(item, data.quantity)
        return self._build_item_response(item)

    async def delete_item(self, session_id: str, item_id: int) -> bool:
        item = await self._cart_repo.get_cart_item(item_id, session_id)
        if not item:
            return False

        await self._cart_repo.delete_item(item)
        return True

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.services.cart_service import CartService
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse

router = APIRouter(prefix="/api/cart", tags=["Cart"])


def _get_service(db: AsyncSession = Depends(get_db)) -> CartService:
    return CartService(CartRepository(db), ProductRepository(db))


@router.get("/", response_model=CartResponse, summary="Содержимое корзины")
async def get_cart(
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(_get_service),
):
    return await service.get_cart(str(current_user.id))


@router.post("/", response_model=CartItemResponse, status_code=201, summary="Добавить товар в корзину")
async def add_to_cart(
    data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(_get_service),
):
    result = await service.add_item(str(current_user.id), data)
    if result is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return result


@router.put("/{item_id}/", response_model=CartItemResponse, summary="Изменить количество товара")
async def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(_get_service),
):
    result = await service.update_item(str(current_user.id), item_id, data)
    if result is None:
        raise HTTPException(status_code=404, detail="Элемент корзины не найден")
    return result


@router.delete("/{item_id}/", status_code=204, summary="Удалить товар из корзины")
async def delete_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(_get_service),
):
    deleted = await service.delete_item(str(current_user.id), item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Элемент корзины не найден")
    return Response(status_code=204)

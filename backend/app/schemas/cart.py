from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.product import ProductResponse


class CartItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, default=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)


class CartItemResponse(BaseModel):
    id: int
    product: ProductResponse
    quantity: int
    total_price: Decimal

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: int
    session_id: str
    items: list[CartItemResponse]
    total_price: Decimal

    model_config = {"from_attributes": True}

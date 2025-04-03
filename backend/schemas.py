from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        orm_mode = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Product schemas
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str

class ProductCreate(ProductBase):
    inventory: int
    dimensions: Optional[str] = None
    weight: Optional[str] = None
    material: Optional[str] = None
    capacity: Optional[str] = None

class Product(ProductBase):
    id: int
    inventory: int
    dimensions: Optional[str] = None
    weight: Optional[str] = None
    material: Optional[str] = None
    capacity: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

# Cart item schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItem(CartItemBase):
    id: int
    cart_id: int
    
    class Config:
        orm_mode = True

# Cart with items schema
class CartItemWithProduct(CartItem):
    product: Product

    class Config:
        orm_mode = True

class Cart(BaseModel):
    id: int
    user_id: int
    items: List[CartItemWithProduct] = []

    class Config:
        orm_mode = True

# Order schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    product: Product

    class Config:
        orm_mode = True

class OrderCreate(BaseModel):
    shipping_address: str

class Order(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    shipping_address: str
    created_at: datetime
    items: List[OrderItem] = []

    class Config:
        orm_mode = True


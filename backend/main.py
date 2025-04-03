from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Local imports
from database import SessionLocal, engine
import models
import schemas

# Load environment variables
load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Brovion Art API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# Auth routes
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not user.verify_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(
        email=user.email,
        full_name=user.full_name
    )
    new_user.set_password(user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Product routes
@app.get("/products/", response_model=List[schemas.Product])
def get_products(
    category: Optional[str] = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)
    if category:
        query = query.filter(models.Product.category == category)
    return query.offset(skip).limit(limit).all()

@app.get("/products/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products/", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only admin can create products
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# Cart routes
@app.get("/cart/", response_model=schemas.Cart)
def get_cart(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        # Create a new cart if one doesn't exist
        cart = models.Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

@app.post("/cart/items/", response_model=schemas.CartItem)
def add_cart_item(
    item: schemas.CartItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get or create cart
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        cart = models.Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Check if product exists
    product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == item.product_id
    ).first()
    
    if cart_item:
        # Update quantity if item exists
        cart_item.quantity += item.quantity
    else:
        # Create new cart item
        cart_item = models.CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(cart_item)
    
    db.commit()
    db.refresh(cart_item)
    return cart_item

@app.put("/cart/items/{item_id}", response_model=schemas.CartItem)
def update_cart_item(
    item_id: int,
    item_update: schemas.CartItemUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get cart
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Get cart item
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    # Update quantity
    cart_item.quantity = item_update.quantity
    
    # Remove item if quantity is 0
    if cart_item.quantity <= 0:
        db.delete(cart_item)
        db.commit()
        return {"id": item_id, "message": "Item removed from cart"}
    
    db.commit()
    db.refresh(cart_item)
    return cart_item

@app.delete("/cart/items/{item_id}")
def delete_cart_item(
    item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get cart
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Get cart item
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    # Delete item
    db.delete(cart_item)
    db.commit()
    
    return {"message": "Item removed from cart"}

# Order routes
@app.post("/orders/", response_model=schemas.Order)
def create_order(
    order_data: schemas.OrderCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get cart
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total
    total = sum(item.quantity * item.product.price for item in cart.items)
    
    # Create order
    order = models.Order(
        user_id=current_user.id,
        total_amount=total,
        shipping_address=order_data.shipping_address,
        status="pending"
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Create order items from cart items
    for cart_item in cart.items:
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        )
        db.add(order_item)
    
    # Clear cart
    for item in cart.items:
        db.delete(item)
    
    db.commit()
    db.refresh(order)
    return order

@app.get("/orders/", response_model=List[schemas.Order])
def get_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Order).filter(models.Order.user_id == current_user.id).all()

@app.get("/orders/{order_id}", response_model=schemas.Order)
def get_order(
    order_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

# Seed data endpoint (for development)
@app.post("/seed-data/")
def seed_data(db: Session = Depends(get_db)):
    # Check if data already exists
    if db.query(models.Product).count() > 0:
        return {"message": "Data already seeded"}
    
    # Create admin user
    admin = models.User(
        email="admin@brovionart.com",
        full_name="Admin User",
        is_admin=True
    )
    admin.set_password("admin123")
    db.add(admin)
    
    # Create products
    wall_art_products = [
        {
            "name": "Copper Tree of Life",
            "description": "Handcrafted copper wall art depicting the tree of life, symbolizing growth and connection. This intricate piece is made from high-quality copper and features detailed branches and leaves that catch the light beautifully. Each piece is handmade by our skilled artisans, ensuring that no two are exactly alike.",
            "price": 129.99,
            "category": "wall-art",
            "inventory": 10,
            "image_url": "/placeholder.svg?height=600&width=600",
            "dimensions": "24\" x 24\"",
            "weight": "3.5 lbs",
            "material": "Pure Copper"
        },
        {
            "name": "Metal Mandala Wall Art",
            "description": "Intricate metal mandala design, perfect for adding a touch of elegance to any wall. This beautiful mandala is crafted with precision and attention to detail, creating a mesmerizing pattern that draws the eye. The metal construction ensures durability while maintaining a lightweight profile for easy hanging.",
            "price": 89.99,
            "category": "wall-art",
            "inventory": 15,
            "image_url": "/placeholder.svg?height=600&width=600",
            "dimensions": "20\" diameter",
            "weight": "2.8 lbs",
            "material": "Iron with copper finish"
        },
        {
            "name": "Metal Butterfly Wall Art",
            "description": "Beautiful metal butterfly design that adds a touch of nature to your walls. This delicate yet sturdy piece captures the grace and beauty of butterflies in flight. The metal construction catches and reflects light, creating a dynamic display that changes throughout the day.",
            "price": 79.99,
            "category": "wall-art",
            "inventory": 8,
            "image_url": "/placeholder.svg?height=600&width=600",
            "dimensions": "18\" x 14\"",
            "weight": "2.2 lbs",
            "material": "Brass with patina finish"
        }
    ]
    
    copper_bottle_products = [
        {
            "name": "Engraved Copper Bottle",
            "description": "Premium copper bottle with intricate hand-engraved designs. Keeps water naturally pure. This bottle is crafted from high-quality copper and features traditional hand-engraved patterns that showcase the skill of our artisans. Copper naturally ionizes water, making it more alkaline and beneficial for health.",
            "price": 49.99,
            "category": "copper-bottles",
            "inventory": 20,
            "image_url": "/placeholder.svg?height=600&width=600",
            "capacity": "750 ml",
            "weight": "0.9 lbs",
            "material": "99.5% Pure Copper"
        },
        {
            "name": "Hammered Copper Bottle",
            "description": "Copper bottle with a beautiful hammered texture for a unique look. The hammered finish not only enhances the visual appeal but also strengthens the bottle. Each hammer mark is made by hand, creating a one-of-a-kind pattern that catches the light beautifully.",
            "price": 54.99,
            "category": "copper-bottles",
            "inventory": 12,
            "image_url": "/placeholder.svg?height=600&width=600",
            "capacity": "850 ml",
            "weight": "1.0 lbs",
            "material": "Pure Copper"
        },
        {
            "name": "Copper Bottle with Wooden Lid",
            "description": "Copper bottle featuring a handcrafted wooden lid for an eco-friendly touch. This bottle combines the health benefits of copper with the natural warmth of wood. The wooden lid provides a secure seal and adds a touch of organic elegance to the design.",
            "price": 59.99,
            "category": "copper-bottles",
            "inventory": 15,
            "image_url": "/placeholder.svg?height=600&width=600",
            "capacity": "950 ml",
            "weight": "1.2 lbs",
            "material": "Pure Copper with Teak Wood Lid"
        }
    ]
    
    # Add all products to database
    for product_data in wall_art_products + copper_bottle_products:
        product = models.Product(**product_data)
        db.add(product)
    
    db.commit()
    
    return {"message": "Data seeded successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


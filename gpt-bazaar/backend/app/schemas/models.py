from datetime import datetime, timezone
from typing import Literal, Optional
from pydantic import BaseModel, Field


DietaryType = Literal["veg", "non_veg", "none"]
OrderStatus = Literal["placed", "packed", "out_for_delivery", "delivered", "cancelled"]
PaymentMethod = Literal["upi", "card", "netbanking", "wallet", "cod"]
PaymentStatus = Literal["pending", "paid", "cod_due", "refunded"]


class ProductVariant(BaseModel):
    id: str = Field(..., max_length=60)
    label: str = Field(..., max_length=60)
    unitValue: float = Field(..., gt=0)
    unit: str = Field(..., max_length=16)
    price: float = Field(..., gt=0)
    mrp: float = Field(..., gt=0)
    discountPercent: int = Field(0, ge=0, le=95)
    stock: int = Field(0, ge=0)
    sku: str = Field(..., max_length=60)


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=140)
    slug: str = Field(..., pattern=r"^[a-z0-9\-]+$", max_length=140)
    brand: Optional[str] = Field(None, max_length=80)
    tagline: Optional[str] = Field(None, max_length=160)
    categoryId: str = Field(..., max_length=80)
    subcategory: Optional[str] = Field(None, max_length=80)
    description: Optional[str] = Field(None, max_length=1000)
    keyFeatures: list[str] = Field(default_factory=list, max_length=8)
    dietaryType: DietaryType = "veg"
    artworkKey: Optional[str] = Field("fruits_veg", max_length=60)
    imageUrl: Optional[str] = Field("", max_length=1000)
    variants: list[ProductVariant] = Field(..., min_length=1, max_length=8)
    defaultVariantId: str = Field(..., max_length=60)
    isPopular: bool = False
    isTrending: bool = False
    isActive: bool = True
    storeId: str = "store-chittoor-01"
    tags: list[str] = Field(default_factory=list, max_length=10)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=140)
    slug: Optional[str] = Field(None, pattern=r"^[a-z0-9\-]+$", max_length=140)
    brand: Optional[str] = Field(None, max_length=80)
    tagline: Optional[str] = Field(None, max_length=160)
    categoryId: Optional[str] = Field(None, max_length=80)
    subcategory: Optional[str] = Field(None, max_length=80)
    description: Optional[str] = Field(None, max_length=1000)
    keyFeatures: Optional[list[str]] = Field(None, max_length=8)
    dietaryType: Optional[DietaryType] = None
    artworkKey: Optional[str] = Field(None, max_length=60)
    imageUrl: Optional[str] = Field(None, max_length=1000)
    variants: Optional[list[ProductVariant]] = Field(None, min_length=1, max_length=8)
    defaultVariantId: Optional[str] = Field(None, max_length=60)
    deliveryEtaMins: Optional[int] = Field(None, ge=1, le=180)
    isPopular: Optional[bool] = None
    isTrending: Optional[bool] = None
    isActive: Optional[bool] = None
    tags: Optional[list[str]] = Field(None, max_length=10)


class ProductRecord(ProductCreate):
    id: str
    rating: float = 4.6
    reviewCount: int = 0
    deliveryEtaMins: int = 12
    schemaVersion: int = 1
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class OrderItem(BaseModel):
    productId: str
    variantId: str
    name: str
    variantLabel: str
    unitPrice: float = Field(..., gt=0)
    mrp: float = Field(..., gt=0)
    qty: int = Field(..., ge=1)


class OrderPricing(BaseModel):
    itemTotal: float
    discount: float = 0
    couponCode: Optional[str] = None
    deliveryFee: float = 0
    packagingFee: float = 5
    grandTotal: float
    totalSavings: float = 0


class OrderTimelineEvent(BaseModel):
    status: OrderStatus
    label: str
    note: str
    timestamp: str


class OrderCreate(BaseModel):
    storeId: str = "store-chittoor-01"
    customerName: str = Field(..., min_length=1, max_length=100)
    customerPhone: Optional[str] = Field(None, max_length=24)
    deliveryAddress: dict
    items: list[OrderItem] = Field(..., min_length=1, max_length=50)
    pricing: OrderPricing
    paymentMethod: PaymentMethod = "upi"


class OrderRecord(OrderCreate):
    id: str
    orderNumber: str
    paymentStatus: PaymentStatus = "paid"
    status: OrderStatus = "placed"
    statusTimeline: list[OrderTimelineEvent] = Field(default_factory=list)
    etaText: str = "10–15 mins"
    schemaVersion: int = 1
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    note: Optional[str] = None

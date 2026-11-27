from datetime import datetime, timezone
from typing import Literal, Optional
from pydantic import BaseModel, Field


DietaryType = Literal["veg", "non_veg", "none"]
OrderStatus = Literal["placed", "packed", "out_for_delivery", "delivered", "cancelled"]
PaymentMethod = Literal["upi", "card", "netbanking", "wallet", "cod"]
PaymentStatus = Literal["pending", "paid", "cod_due", "refunded"]


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    slug: str = Field(..., pattern=r"^[a-z0-9\-]+$", max_length=80)
    subtitle: Optional[str] = Field("", max_length=160)
    artworkKey: Optional[str] = Field("fruits_veg", max_length=60)
    imageUrl: Optional[str] = Field("", max_length=1000)
    bgTint: str = Field("#EEF9F0", max_length=32)
    subcategories: list[str] = Field(default_factory=list, max_length=12)
    sortOrder: int = Field(0, ge=0, le=1000)
    isActive: bool = True


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=80)
    slug: Optional[str] = Field(None, pattern=r"^[a-z0-9\-]+$", max_length=80)
    subtitle: Optional[str] = Field(None, max_length=160)
    artworkKey: Optional[str] = Field(None, max_length=60)
    imageUrl: Optional[str] = Field(None, max_length=1000)
    bgTint: Optional[str] = Field(None, max_length=32)
    subcategories: Optional[list[str]] = Field(None, max_length=12)
    sortOrder: Optional[int] = Field(None, ge=0, le=1000)
    isActive: Optional[bool] = None


class CategoryRecord(CategoryCreate):
    id: str
    schemaVersion: int = 1
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


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
    storeId: str = "store-chittoor-hub-1"
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
    artworkKey: Optional[str] = "fruits_veg"
    imageUrl: Optional[str] = ""


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
    storeId: str = "store-chittoor-hub-1"
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


class OrderRatingUpdate(BaseModel):
    rating: int = Field(..., ge=1, le=5)


class AppConfigRecord(BaseModel):
    id: str = "mobile"
    storeName: str = "GPT Bazaar Chittoor Hub"
    hubCity: str = "Chittoor"
    pincode: str = "517584"
    deliveryEtaText: str = "10–15 mins"
    isStoreOpen: bool = True
    heroBadge: str = "UP TO 40% OFF"
    heroTitle: str = "Fresh picks, better prices"
    heroSubtitle: str = "Handpicked farm produce & daily essentials delivered in minutes."
    dealBannerTitle: str = "Free delivery on orders above ₹149"
    dealBannerSubtitle: str = "Use code GROCER10 in cart for instant savings on daily essentials."
    freeDeliveryThreshold: float = 149
    deliveryFee: float = 25
    packagingFee: float = 5
    schemaVersion: int = 1
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AppConfigUpdate(BaseModel):
    storeName: Optional[str] = Field(None, min_length=1, max_length=120)
    hubCity: Optional[str] = Field(None, min_length=1, max_length=80)
    pincode: Optional[str] = Field(None, min_length=4, max_length=12)
    deliveryEtaText: Optional[str] = Field(None, min_length=1, max_length=40)
    isStoreOpen: Optional[bool] = None
    heroBadge: Optional[str] = Field(None, max_length=40)
    heroTitle: Optional[str] = Field(None, max_length=120)
    heroSubtitle: Optional[str] = Field(None, max_length=240)
    dealBannerTitle: Optional[str] = Field(None, max_length=120)
    dealBannerSubtitle: Optional[str] = Field(None, max_length=240)
    freeDeliveryThreshold: Optional[float] = Field(None, ge=0)
    deliveryFee: Optional[float] = Field(None, ge=0)
    packagingFee: Optional[float] = Field(None, ge=0)


class UploadImageResponse(BaseModel):
    imageUrl: str
    path: str
    contentType: str
    sizeBytes: int

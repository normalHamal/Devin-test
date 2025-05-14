from pydantic import BaseModel
from typing import List, Dict, Optional, Any


class SalesData(BaseModel):
    platform: str
    product_name: str
    sales_count: int
    price: float
    date: str


class PlatformSummary(BaseModel):
    platform: str
    total_sales: int
    total_revenue: float
    products: List[Dict[str, Any]]

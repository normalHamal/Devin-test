from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.models import SalesData, PlatformSummary
from app.scrapers import generate_mock_sales_data, get_platform_summary

app = FastAPI(title="DJI Sales Dashboard API")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

sales_data = generate_mock_sales_data()


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/api/sales", response_model=List[Dict[str, Any]])
async def get_sales(
    platform: Optional[str] = None,
    product: Optional[str] = None,
    days: int = Query(7, ge=1, le=30)
):
    """
    Get sales data filtered by platform, product, and time range
    """
    today = datetime.now()
    threshold_date = (today - timedelta(days=days)).strftime("%Y-%m-%d")
    
    filtered_data = [
        item for item in sales_data 
        if item["date"] >= threshold_date
        and (platform is None or item["platform"] == platform)
        and (product is None or product.lower() in item["product_name"].lower())
    ]
    
    return filtered_data


@app.get("/api/platforms", response_model=List[Dict[str, Any]])
async def get_platforms(days: int = Query(7, ge=1, le=30)):
    """
    Get summary data for all platforms
    """
    today = datetime.now()
    threshold_date = (today - timedelta(days=days)).strftime("%Y-%m-%d")
    
    filtered_data = [
        item for item in sales_data 
        if item["date"] >= threshold_date
    ]
    
    platform_summaries = get_platform_summary(filtered_data)
    
    return platform_summaries


@app.get("/api/products")
async def get_products():
    """
    Get a list of all DJI products
    """
    products = list(set(item["product_name"] for item in sales_data))
    products.sort()
    
    return {"products": products}





@app.on_event("startup")
async def startup_event():
    """
    Initialize data on startup
    """
    global sales_data
    sales_data = generate_mock_sales_data()

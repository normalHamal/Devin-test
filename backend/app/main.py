from fastapi import FastAPI, Query, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import os
from datetime import datetime, timedelta

from app.models import SalesData, PlatformSummary
from app.scrapers import generate_mock_sales_data, get_platform_summary
from app.scheduler import scheduler_instance

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


@app.post("/api/screenshot")
async def take_screenshot(
    user_ids: List[str] = Body(..., embed=True),
    frontend_url: str = Body(..., embed=True)
):
    """
    Manually trigger a screenshot and send it to specified DingTalk users
    """
    scheduler_instance.set_frontend_url(frontend_url)
    scheduler_instance.set_user_ids(user_ids)
    
    success = scheduler_instance.take_screenshot_now()
    
    if success:
        return {"status": "success", "message": "Screenshot taken and sent"}
    else:
        raise HTTPException(status_code=500, detail="Failed to take or send screenshot")


@app.post("/api/schedule")
async def schedule_screenshots(
    user_ids: List[str] = Body(..., embed=True),
    frontend_url: str = Body(..., embed=True)
):
    """
    Start scheduled screenshots
    """
    scheduler_instance.set_frontend_url(frontend_url)
    scheduler_instance.set_user_ids(user_ids)
    
    scheduler_instance.start()
    
    interval_seconds = int(os.getenv("SCREENSHOT_INTERVAL", 3600))
    interval_hours = interval_seconds / 3600
    
    return {
        "status": "success", 
        "message": f"Scheduled screenshots every {interval_hours} hours"
    }


@app.post("/api/stop-schedule")
async def stop_schedule():
    """
    Stop scheduled screenshots
    """
    scheduler_instance.stop()
    return {"status": "success", "message": "Scheduled screenshots stopped"}


@app.on_event("startup")
async def startup_event():
    """
    Initialize data on startup
    """
    global sales_data
    sales_data = generate_mock_sales_data()


@app.on_event("shutdown")
async def shutdown_event():
    """
    Clean up on shutdown
    """
    scheduler_instance.stop()

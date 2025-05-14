import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

DJI_PRODUCTS = [
    {"name": "DJI Mini 3", "base_price": 499},
    {"name": "DJI Air 3", "base_price": 899},
    {"name": "DJI Mavic 3", "base_price": 1599},
    {"name": "DJI Mavic 3 Pro", "base_price": 2199},
    {"name": "DJI FPV", "base_price": 999},
    {"name": "DJI Avata", "base_price": 799},
    {"name": "DJI Osmo Action 4", "base_price": 399},
    {"name": "DJI Osmo Pocket 3", "base_price": 519},
    {"name": "DJI Osmo Mobile 6", "base_price": 159},
]

E_COMMERCE_PLATFORMS = [
    "JD.com",
    "Tmall",
    "Taobao",
    "Amazon",
    "Suning",
]


def generate_mock_sales_data() -> List[Dict[str, Any]]:
    """
    Generate mock sales data for DJI products across different e-commerce platforms.
    In a real implementation, this would be replaced with actual web scraping.
    """
    today = datetime.now()
    sales_data = []

    for platform in E_COMMERCE_PLATFORMS:
        for product in DJI_PRODUCTS:
            for day_offset in range(30):
                date = (today - timedelta(days=day_offset)).strftime("%Y-%m-%d")
                
                platform_factor = 1.0
                if platform == "JD.com":
                    platform_factor = 1.2
                elif platform == "Tmall":
                    platform_factor = 1.3
                elif platform == "Taobao":
                    platform_factor = 1.1
                
                product_factor = 1.0
                if "Mini" in product["name"]:
                    product_factor = 1.5
                elif "Air" in product["name"]:
                    product_factor = 1.3
                elif "Osmo" in product["name"]:
                    product_factor = 1.2
                
                base_sales = random.randint(5, 50)
                sales_count = int(base_sales * platform_factor * product_factor)
                
                discount = random.uniform(0.85, 1.0)
                price = round(product["base_price"] * discount, 2)
                
                sales_data.append({
                    "platform": platform,
                    "product_name": product["name"],
                    "sales_count": sales_count,
                    "price": price,
                    "date": date
                })
    
    return sales_data


def get_platform_summary(sales_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Aggregate sales data by platform
    """
    platform_summary = {}
    
    for item in sales_data:
        platform = item["platform"]
        if platform not in platform_summary:
            platform_summary[platform] = {
                "platform": platform,
                "total_sales": 0,
                "total_revenue": 0,
                "products": {}
            }
        
        platform_summary[platform]["total_sales"] += item["sales_count"]
        platform_summary[platform]["total_revenue"] += item["sales_count"] * item["price"]
        
        product_name = item["product_name"]
        if product_name not in platform_summary[platform]["products"]:
            platform_summary[platform]["products"][product_name] = {
                "name": product_name,
                "total_sales": 0,
                "total_revenue": 0
            }
        
        platform_summary[platform]["products"][product_name]["total_sales"] += item["sales_count"]
        platform_summary[platform]["products"][product_name]["total_revenue"] += item["sales_count"] * item["price"]
    
    for platform in platform_summary:
        platform_summary[platform]["products"] = list(platform_summary[platform]["products"].values())
        platform_summary[platform]["total_revenue"] = round(platform_summary[platform]["total_revenue"], 2)
        for product in platform_summary[platform]["products"]:
            product["total_revenue"] = round(product["total_revenue"], 2)
    
    return list(platform_summary.values())

export interface SalesData {
  platform: string;
  product_name: string;
  sales_count: number;
  price: number;
  date: string;
}

export interface PlatformSummary {
  platform: string;
  total_sales: number;
  total_revenue: number;
  products: ProductSummary[];
}

export interface ProductSummary {
  name: string;
  total_sales: number;
  total_revenue: number;
}

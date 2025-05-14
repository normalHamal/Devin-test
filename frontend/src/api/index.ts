import { SalesData, PlatformSummary } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchSalesData = async (
  platform?: string,
  product?: string,
  days: number = 7
): Promise<SalesData[]> => {
  let url = `${API_URL}/api/sales?days=${days}`;
  
  if (platform) {
    url += `&platform=${encodeURIComponent(platform)}`;
  }
  
  if (product) {
    url += `&product=${encodeURIComponent(product)}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sales data: ${response.statusText}`);
  }
  
  return response.json();
};

export const fetchPlatformSummaries = async (days: number = 7): Promise<PlatformSummary[]> => {
  const response = await fetch(`${API_URL}/api/platforms?days=${days}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch platform summaries: ${response.statusText}`);
  }
  
  return response.json();
};

export const fetchProducts = async (): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/products`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.products;
};

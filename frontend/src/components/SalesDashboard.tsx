import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SalesData, PlatformSummary } from '../types';
import { fetchSalesData, fetchPlatformSummaries, fetchProducts } from '../api';
import { DashboardHeader } from './DashboardHeader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function SalesDashboard() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [platformSummaries, setPlatformSummaries] = useState<PlatformSummary[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [days, setDays] = useState<number>(7);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const sales = await fetchSalesData(selectedPlatform || undefined, selectedProduct || undefined, days);
        setSalesData(sales);
        
        const summaries = await fetchPlatformSummaries(days);
        setPlatformSummaries(summaries);
        
        const uniquePlatforms = Array.from(new Set(sales.map(item => item.platform)));
        setPlatforms(uniquePlatforms);
        
        if (products.length === 0) {
          const productList = await fetchProducts();
          setProducts(productList);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [days, selectedPlatform, selectedProduct]);
  
  const prepareDailySalesData = () => {
    const dailyData: Record<string, Record<string, number>> = {};
    
    salesData.forEach(item => {
      if (!dailyData[item.date]) {
        dailyData[item.date] = {};
      }
      
      const platform = item.platform;
      if (!dailyData[item.date][platform]) {
        dailyData[item.date][platform] = 0;
      }
      
      dailyData[item.date][platform] += item.sales_count;
    });
    
    return Object.entries(dailyData)
      .map(([date, platforms]) => ({
        date,
        ...platforms,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };
  
  const preparePlatformComparisonData = () => {
    return platformSummaries.map(summary => ({
      platform: summary.platform,
      sales: summary.total_sales,
      revenue: summary.total_revenue,
    }));
  };
  
  const prepareProductDistributionData = () => {
    const productData: Record<string, number> = {};
    
    salesData.forEach(item => {
      if (!productData[item.product_name]) {
        productData[item.product_name] = 0;
      }
      productData[item.product_name] += item.sales_count;
    });
    
    return Object.entries(productData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 p-4">错误: {error}</div>;
  }
  
  const dailySalesData = prepareDailySalesData();
  const platformComparisonData = preparePlatformComparisonData();
  const productDistributionData = prepareProductDistributionData();
  
  return (
    <div className="container mx-auto px-4 py-8" id="dashboard-container">
      <DashboardHeader
        days={days}
        setDays={setDays}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        platforms={platforms}
        products={products}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>平台销量总览</CardTitle>
            <CardDescription>各电商平台销量对比</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" name="销量" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>平台销售额总览</CardTitle>
            <CardDescription>各电商平台销售额对比</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="销售额" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>每日销量趋势</CardTitle>
          <CardDescription>各平台每日销量变化</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {platforms.map((platform, index) => (
                <Line
                  key={platform}
                  type="monotone"
                  dataKey={platform}
                  name={platform}
                  stroke={COLORS[index % COLORS.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>产品销量分布</CardTitle>
            <CardDescription>各产品销量占比</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {productDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>平台详情</CardTitle>
            <CardDescription>各平台产品销量详情</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={platformSummaries[0]?.platform || ""}>
              <TabsList className="mb-4">
                {platformSummaries.map(summary => (
                  <TabsTrigger key={summary.platform} value={summary.platform}>
                    {summary.platform}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {platformSummaries.map(summary => (
                <TabsContent key={summary.platform} value={summary.platform}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">总销量</div>
                        <div className="text-2xl font-bold">{summary.total_sales}</div>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">总销售额</div>
                        <div className="text-2xl font-bold">${summary.total_revenue.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">产品销量排行</div>
                      {summary.products
                        .sort((a, b) => b.total_sales - a.total_sales)
                        .slice(0, 5)
                        .map((product, index) => (
                          <div key={product.name} className="flex justify-between items-center py-2 border-b">
                            <div className="flex items-center">
                              <span className="text-gray-500 mr-2">{index + 1}.</span>
                              <span>{product.name}</span>
                            </div>
                            <div className="font-medium">{product.total_sales}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

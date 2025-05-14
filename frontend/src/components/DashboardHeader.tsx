import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Camera, Download } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface DashboardHeaderProps {
  days: number;
  setDays: (days: number) => void;
  selectedPlatform: string | null;
  setSelectedPlatform: (platform: string | null) => void;
  selectedProduct: string | null;
  setSelectedProduct: (product: string | null) => void;
  platforms: string[];
  products: string[];
}

export function DashboardHeader({
  days,
  setDays,
  selectedPlatform,
  setSelectedPlatform,
  selectedProduct,
  setSelectedProduct,
  platforms,
  products,
}: DashboardHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const handleTakeScreenshot = async () => {
    try {
      setIsCapturing(true);
      
      setIsDialogOpen(false);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dashboardElement = document.getElementById('dashboard-container');
      
      if (!dashboardElement) {
        toast.error('无法找到仪表板元素');
        setIsCapturing(false);
        return;
      }
      
      const canvas = await html2canvas(dashboardElement, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshotPreview(dataUrl);
      setIsDialogOpen(true);
      setIsCapturing(false);
    } catch (error) {
      toast.error(`截图错误: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsCapturing(false);
    }
  };
  
  const handleDownloadScreenshot = () => {
    if (!screenshotPreview) return;
    
    const link = document.createElement('a');
    link.href = screenshotPreview;
    link.download = `DJI-销售数据-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('截图已下载');
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">DJI 产品销售数据看板</h1>
        
        <div className="flex flex-wrap gap-2">
          {isCapturing ? (
            <Button variant="outline" disabled>
              <span className="animate-pulse">截图中...</span>
            </Button>
          ) : (
            <Button variant="outline" onClick={handleTakeScreenshot} className="flex items-center gap-2">
              <Camera size={16} />
              <span>截图</span>
            </Button>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {screenshotPreview && (
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>截图预览</DialogTitle>
                  <DialogDescription>
                    您可以下载此截图或关闭此窗口
                  </DialogDescription>
                </DialogHeader>
                
                <div className="overflow-auto max-h-[70vh]">
                  <img 
                    src={screenshotPreview} 
                    alt="Dashboard Screenshot" 
                    className="w-full h-auto rounded-md border border-gray-200"
                  />
                </div>
                
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    关闭
                  </Button>
                  <Button onClick={handleDownloadScreenshot} className="flex items-center gap-2">
                    <Download size={16} />
                    <span>下载截图</span>
                  </Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="time-range">时间范围</Label>
          <Select
            value={days.toString()}
            onValueChange={(value) => setDays(parseInt(value))}
          >
            <SelectTrigger id="time-range">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">最近7天</SelectItem>
              <SelectItem value="14">最近14天</SelectItem>
              <SelectItem value="30">最近30天</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="platform">电商平台</Label>
          <Select
            value={selectedPlatform || 'all'}
            onValueChange={(value) => setSelectedPlatform(value === 'all' ? null : value)}
          >
            <SelectTrigger id="platform">
              <SelectValue placeholder="选择平台" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部平台</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="product">产品</Label>
          <Select
            value={selectedProduct || 'all'}
            onValueChange={(value) => setSelectedProduct(value === 'all' ? null : value)}
          >
            <SelectTrigger id="product">
              <SelectValue placeholder="选择产品" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部产品</SelectItem>
              {products.map((product) => (
                <SelectItem key={product} value={product}>
                  {product}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

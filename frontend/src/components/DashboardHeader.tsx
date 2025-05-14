import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { takeScreenshot, scheduleScreenshots, stopSchedule } from '../api';
import { DingTalkConfig } from '../types';
import { Camera, Clock, StopCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  const [userIds, setUserIds] = useState<string>('');
  const [frontendUrl, setFrontendUrl] = useState<string>(window.location.href);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleTakeScreenshot = async () => {
    if (!userIds) {
      toast.error('Please enter at least one DingTalk user ID');
      return;
    }
    
    try {
      const config: DingTalkConfig = {
        userIds: userIds.split(',').map(id => id.trim()),
        frontendUrl,
      };
      
      const result = await takeScreenshot(config);
      toast.success(result.message);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleScheduleScreenshots = async () => {
    if (!userIds) {
      toast.error('Please enter at least one DingTalk user ID');
      return;
    }
    
    try {
      const config: DingTalkConfig = {
        userIds: userIds.split(',').map(id => id.trim()),
        frontendUrl,
      };
      
      const result = await scheduleScreenshots(config);
      toast.success(result.message);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleStopSchedule = async () => {
    try {
      const result = await stopSchedule();
      toast.success(result.message);
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">DJI 产品销售数据看板</h1>
        
        <div className="flex flex-wrap gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Camera size={16} />
                <span>截图</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>截图设置</DialogTitle>
                <DialogDescription>
                  配置截图并发送到钉钉
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="userIds" className="text-right">
                    钉钉用户ID
                  </Label>
                  <Input
                    id="userIds"
                    placeholder="用户ID，多个用逗号分隔"
                    className="col-span-3"
                    value={userIds}
                    onChange={(e) => setUserIds(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="frontendUrl" className="text-right">
                    前端URL
                  </Label>
                  <Input
                    id="frontendUrl"
                    className="col-span-3"
                    value={frontendUrl}
                    onChange={(e) => setFrontendUrl(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleTakeScreenshot} className="flex items-center gap-2">
                  <Camera size={16} />
                  <span>立即截图</span>
                </Button>
                <Button onClick={handleScheduleScreenshots} className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>定时截图</span>
                </Button>
                <Button variant="destructive" onClick={handleStopSchedule} className="flex items-center gap-2">
                  <StopCircle size={16} />
                  <span>停止定时</span>
                </Button>
              </DialogFooter>
            </DialogContent>
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

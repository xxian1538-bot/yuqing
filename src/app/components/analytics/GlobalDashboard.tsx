import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { SentimentStatistics } from './SentimentStatistics';
import { DisposalStatistics } from '../disposal/DisposalStatistics';
import { CommentStatistics } from '../comment/CommentStatistics';

export function GlobalDashboard() {
  const [dateRange, setDateRange] = useState("7days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">数据看板</h1>
        </div>

        {/* 全局时间筛选 */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <Calendar className="w-5 h-5 text-gray-500" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="yesterday">昨日</SelectItem>
              <SelectItem value="7days">近7天</SelectItem>
              <SelectItem value="30days">近30天</SelectItem>
              <SelectItem value="custom">自定义时间</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-9"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-9"
              />
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="sentiment" className="bg-transparent">
        <TabsList className="mb-6 h-12 bg-white border border-gray-200 rounded-lg p-1">
          <TabsTrigger value="sentiment" className="text-base px-6 h-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">舆情概览</TabsTrigger>
          <TabsTrigger value="disposal" className="text-base px-6 h-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">处置分析</TabsTrigger>
          <TabsTrigger value="comment" className="text-base px-6 h-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">网评效果</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="mt-0">
          <SentimentStatistics />
        </TabsContent>

        <TabsContent value="disposal" className="mt-0">
          <DisposalStatistics />
        </TabsContent>

        <TabsContent value="comment" className="mt-0">
          <CommentStatistics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

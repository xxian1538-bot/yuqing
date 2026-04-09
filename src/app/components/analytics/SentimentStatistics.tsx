import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockSentiments } from '../../data/mockData';

export function SentimentStatistics() {
  const [dateRange, setDateRange] = useState("7days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // 趋势数据
  const trendData = [
    { date: '03-18', count: 12, positive: 5, neutral: 4, negative: 3 },
    { date: '03-19', count: 15, positive: 7, neutral: 5, negative: 3 },
    { date: '03-20', count: 18, positive: 8, neutral: 6, negative: 4 },
    { date: '03-21', count: 14, positive: 6, neutral: 5, negative: 3 },
    { date: '03-22', count: 20, positive: 9, neutral: 7, negative: 4 },
    { date: '03-23', count: 17, positive: 8, neutral: 6, negative: 3 },
    { date: '03-24', count: 22, positive: 10, neutral: 8, negative: 4 },
  ];

  // 等级分布数据
  const levelData = [
    { name: '轻微', value: 2, color: '#3b82f6' },
    { name: '一般', value: 3, color: '#eab308' },
    { name: '较大', value: 1, color: '#f97316' },
    { name: '重大', value: 0, color: '#ef4444' },
    { name: '特别重大', value: 0, color: '#a855f7' },
  ];

  // 情感分布数据
  const emotionData = [
    { name: '正面', value: mockSentiments.filter(s => s.emotionTrend === '正面').length, color: '#10b981' },
    { name: '中性', value: mockSentiments.filter(s => s.emotionTrend === '中性').length, color: '#6b7280' },
    { name: '负面', value: mockSentiments.filter(s => s.emotionTrend === '负面').length, color: '#ef4444' },
  ];

  // 来源分布数据
  const sourceData = [
    { name: '新媒体', value: 45 },
    { name: '电视', value: 28 },
    { name: '广播', value: 15 },
    { name: '报纸', value: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* 关键指标 */}
      <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总舆情数</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{mockSentiments.length}</div>
              <p className="text-xs text-green-600 mt-1">
                <span className="inline-flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  较上周 +15.2%
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">未处理</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-red-600">
                {mockSentiments.filter(s => s.status === '未处理').length}
              </div>
              <p className="text-xs text-red-600 mt-1">
                <span className="inline-flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  需要关注
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">跟进中</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-blue-600">
                {mockSentiments.filter(s => s.status === '跟进中').length}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                <span className="inline-flex items-center">
                  持续跟踪中
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">已办结</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-green-600">
                {mockSentiments.filter(s => s.status === '已办结').length}
              </div>
              <p className="text-xs text-green-600 mt-1">
                <span className="inline-flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  完成率 {((mockSentiments.filter(s => s.status === '已办结').length / mockSentiments.length) * 100).toFixed(1)}%
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 图表 */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>近7天舆情趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" name="总数" strokeWidth={2} />
                  <Line type="monotone" dataKey="positive" stroke="#10b981" name="正面" strokeWidth={2} />
                  <Line type="monotone" dataKey="negative" stroke="#ef4444" name="负面" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>情感倾向分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emotionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {emotionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>舆情等级分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={levelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {levelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>来源渠道分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 高频关键词 */}
        <Card>
          <CardHeader>
            <CardTitle>高频关键词（近7天）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[
                { word: '改革', count: 156, trend: 'up' },
                { word: 'AI技术', count: 142, trend: 'up' },
                { word: '春节', count: 128, trend: 'down' },
                { word: '社区', count: 95, trend: 'up' },
                { word: '服务', count: 87, trend: 'up' },
                { word: '创新', count: 76, trend: 'up' },
                { word: '政策', count: 68, trend: 'down' },
                { word: '民生', count: 54, trend: 'up' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.word}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    {item.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

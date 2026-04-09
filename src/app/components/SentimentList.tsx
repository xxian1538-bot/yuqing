import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Plus, 
  Download, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Send,
  UserPlus
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Checkbox } from './ui/checkbox';
import { mockSentiments } from '../data/mockData';
import { ManualEntryForm } from './ManualEntryForm';
import { ReportDialog } from './ReportDialog';
import { AssignDialog } from './AssignDialog';
import type { SentimentInfo, SentimentStatus, EmotionTrend } from '../types';

export function SentimentList() {
  const [sentiments, setSentiments] = useState<SentimentInfo[]>(mockSentiments);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<SentimentStatus | '全部'>('全部');
  const [emotionFilter, setEmotionFilter] = useState<EmotionTrend | '全部'>('全部');
  const [dateRange, setDateRange] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  // 弹窗状态
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [currentSentiment, setCurrentSentiment] = useState<SentimentInfo | null>(null);

  const pageSize = 20;

  // 筛选逻辑
  const filteredSentiments = sentiments.filter(sentiment => {
    if (searchKeyword && !sentiment.title.toLowerCase().includes(searchKeyword.toLowerCase()) &&
        !sentiment.content.toLowerCase().includes(searchKeyword.toLowerCase())) {
      return false;
    }
    if (statusFilter !== '全部' && sentiment.status !== statusFilter) {
      return false;
    }
    if (emotionFilter !== '全部' && sentiment.emotionTrend !== emotionFilter) {
      return false;
    }
    return true;
  });

  // 分页
  const totalPages = Math.ceil(filteredSentiments.length / pageSize);
  const paginatedSentiments = filteredSentiments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 全选逻辑
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedSentiments.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 单选逻辑
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // 获取状态标签样式
  const getStatusBadge = (status: SentimentStatus) => {
    const styles = {
      '未处理': 'bg-red-100 text-red-700',
      '跟进中': 'bg-blue-100 text-blue-700',
      '已办结': 'bg-green-100 text-green-700',
      '已报送': 'bg-green-100 text-green-700',
    };
    return (
      <Badge className={styles[status]}>
        {status}
      </Badge>
    );
  };

  // 获取情感倾向标签样式
  const getEmotionBadge = (emotion: EmotionTrend) => {
    const styles = {
      '正面': 'bg-green-100 text-green-700',
      '中性': 'bg-gray-100 text-gray-700',
      '负面': 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={styles[emotion]}>
        {emotion}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">舆情展示</h1>
        
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsManualEntryOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            手动添加舆情
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" disabled={selectedIds.length === 0}>
            <Send className="w-4 h-4 mr-2" />
            批量报送
          </Button>
          <Button variant="outline" disabled={selectedIds.length === 0}>
            <UserPlus className="w-4 h-4 mr-2" />
            批量指派
          </Button>
          <Button variant="outline" disabled={selectedIds.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </Button>
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索标题、内容、来源..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="处理状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部状态</SelectItem>
              <SelectItem value="未处理">未处理</SelectItem>
              <SelectItem value="跟进中">跟进中</SelectItem>
              <SelectItem value="已办结">已办结</SelectItem>
              <SelectItem value="已报送">已报送</SelectItem>
            </SelectContent>
          </Select>

          <Select value={emotionFilter} onValueChange={(value) => setEmotionFilter(value as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="情感倾向" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部倾向</SelectItem>
              <SelectItem value="正面">正面</SelectItem>
              <SelectItem value="中性">中性</SelectItem>
              <SelectItem value="负面">负面</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部时间</SelectItem>
              <SelectItem value="今日">今日</SelectItem>
              <SelectItem value="昨日">昨日</SelectItem>
              <SelectItem value="近7天">近7天</SelectItem>
              <SelectItem value="近30天">近30天</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            更多筛选
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">总舆情数</div>
          <div className="text-2xl font-semibold">{sentiments.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">未处理</div>
          <div className="text-2xl font-semibold text-red-600">
            {sentiments.filter(s => s.status === '未处理').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">跟进中</div>
          <div className="text-2xl font-semibold text-blue-600">
            {sentiments.filter(s => s.status === '跟进中').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">已办结</div>
          <div className="text-2xl font-semibold text-green-600">
            {sentiments.filter(s => s.status === '已办结').length}
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === paginatedSentiments.length && paginatedSentiments.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[150px] max-w-[200px]">标题</TableHead>
              <TableHead className="min-w-[80px]">事件等级</TableHead>
              <TableHead className="min-w-[80px]">报送状态</TableHead>
              <TableHead className="min-w-[100px]">时间</TableHead>
              <TableHead className="min-w-[80px]">来源平台</TableHead>
              <TableHead className="min-w-[150px] max-w-[250px]">内容</TableHead>
              <TableHead className="min-w-[120px] max-w-[200px]">研判建议</TableHead>
              <TableHead className="text-right min-w-[150px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSentiments.map((sentiment) => (
              <TableRow key={sentiment.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(sentiment.id)}
                    onCheckedChange={(checked) => handleSelectOne(sentiment.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="max-w-[200px] xl:max-w-[300px] whitespace-normal">
                  <a
                    href={sentiment.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline line-clamp-2 inline-block align-middle"
                    title={sentiment.title}
                  >
                    {sentiment.title}
                    <ExternalLink className="w-3 h-3 inline-block ml-1" style={{ verticalAlign: 'middle', marginTop: '-2px' }} />
                  </a>
                </TableCell>
                <TableCell>
                  {/* <Badge className={
                    sentiment.level === '审批中' ? 'bg-orange-100 text-orange-700' :
                    sentiment.level === '已通过' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }> */}
                    {sentiment.level}
                  {/* </Badge> */}
                </TableCell>
                <TableCell>
                  <Badge className={sentiment.status === "已报送" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {sentiment.status === "已报送" ? "已报送" : "未报送"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600 whitespace-nowrap">{sentiment.publishTime}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{sentiment.source}</div>
                </TableCell>
                <TableCell className="max-w-[200px] xl:max-w-[250px] whitespace-normal">
                  <div className="text-sm text-gray-600 line-clamp-2" title={sentiment.content}>
                    {sentiment.content}
                  </div>
                </TableCell>
                <TableCell className="max-w-[150px] xl:max-w-[200px] whitespace-normal">
                  <div className="text-sm text-gray-600 line-clamp-2" title={sentiment.analysis}>
                    {sentiment.analysis}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/sentiment/${sentiment.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        详情
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentSentiment(sentiment);
                        setIsReportOpen(true);
                      }}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      报送
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentSentiment(sentiment);
                        setIsAssignOpen(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      指派
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-600">
                      完结
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 分页 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            共 {filteredSentiments.length} 条，第 {currentPage} / {totalPages} 页
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              上一页
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </div>

      <ManualEntryForm
        open={isManualEntryOpen}
        onOpenChange={setIsManualEntryOpen}
        onSubmit={(data) => {
          const newSentiment: SentimentInfo = {
            id: String(Date.now()),
            title: data.title || '无标题',
            source: data.source || '未知',
            publishTime: data.publishTime || new Date().toISOString(),
            content: data.title || '',
            summary: data.summary || '',
            channel: data.source || '未知',
            readCount: data.readCount || 0,
            commentCount: 0,
            likeCount: 0,
            shareCount: 0,
            collectCount: 0,
            emotionTrend: '中性',
            level: data.level || '轻微',
            status: '未处理',
            field: '抖音',
            unit: '默认单位',
            link: data.link || '',
            analysis: data.summary || '',
            createdBy: '当前用户',
            score: data.score
          };
          setSentiments([newSentiment, ...sentiments]);
        }}
      />

      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        sentimentId={currentSentiment?.id || ""}        onSuccess={() => {          if (currentSentiment) {            setSentiments(sentiments.map(s =>               s.id === currentSentiment.id ? { ...s, status: "已报送" } : s            ));          }        }}
      />

      <AssignDialog
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        sentimentId={currentSentiment?.id || ""}        onSuccess={() => {          if (currentSentiment) {            setSentiments(sentiments.map(s =>               s.id === currentSentiment.id ? { ...s, status: "已报送" } : s            ));          }        }}
        sentimentLevel={currentSentiment?.level || "一般"}
      />
    </div>
  );
}
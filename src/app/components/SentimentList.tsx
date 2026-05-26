import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Plus, 
  Download, 
  Trash2, 
  Eye,
  Link2,
  Pencil,
  Search,
  Filter,
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ManualEntryForm } from './ManualEntryForm';
import { ReportDialog } from './ReportDialog';
import { AssignDialog } from './AssignDialog';
import { SentimentEditDialog } from './SentimentEditDialog';
import { SentimentClosureDialog } from './SentimentClosureDialog';
import { SentimentPickerDialog } from './SentimentPickerDialog';
import type { SentimentInfo, SentimentStatus, EmotionTrend } from '../types';
import { getAssociationGroupIds } from '../utils/sentimentAssociations';
import { useSentimentData } from '../context/SentimentDataContext';
import { useTaskWorkflow } from '../context/TaskWorkflowContext';
import { formatDateTimeLocal } from '../utils/sentimentDeadline';

export function SentimentList() {
  const { sentiments, addSentiment, updateSentiment, deleteSentiments, associateEvents } = useSentimentData();
  const { getSentimentTaskStatusById, confirmSentimentClosure } = useTaskWorkflow();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<SentimentStatus | '全部'>('全部');
  const [emotionFilter, setEmotionFilter] = useState<EmotionTrend | '全部'>('全部');
  const [dateRange, setDateRange] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isAssociateOpen, setIsAssociateOpen] = useState(false);
  const [primaryEventId, setPrimaryEventId] = useState('');

  // 弹窗状态
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isClosureOpen, setIsClosureOpen] = useState(false);
  const [isBatchClosureOpen, setIsBatchClosureOpen] = useState(false);
  const [isSingleAssociateOpen, setIsSingleAssociateOpen] = useState(false);
  const [currentSentiment, setCurrentSentiment] = useState<SentimentInfo | null>(null);
  const [reportSentimentIds, setReportSentimentIds] = useState<string[]>([]);
  const [assignSentimentIds, setAssignSentimentIds] = useState<string[]>([]);
  const [closureSentimentIds, setClosureSentimentIds] = useState<string[]>([]);

  const pageSize = 20;
  const associationGroupIds = getAssociationGroupIds(sentiments, selectedIds);
  const associationCandidates = sentiments.filter(sentiment => associationGroupIds.includes(sentiment.id));

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

  const openAssociateDialog = () => {
    if (selectedIds.length < 2) {
      return;
    }

    setPrimaryEventId(selectedIds[0]);
    setIsAssociateOpen(true);
  };

  const handleAssociate = () => {
    if (!primaryEventId) {
      return;
    }

    associateEvents(selectedIds, primaryEventId);
    setSelectedIds([]);
    setIsAssociateOpen(false);
  };

  const openBatchReport = () => {
    if (selectedIds.length === 0) {
      return;
    }
    setReportSentimentIds(selectedIds);
    setCurrentSentiment(null);
    setIsReportOpen(true);
  };

  const openBatchAssign = () => {
    if (selectedIds.length === 0) {
      return;
    }
    setAssignSentimentIds(selectedIds);
    setCurrentSentiment(null);
    setIsAssignOpen(true);
  };

  const openSingleAssociateDialog = (sentiment: SentimentInfo) => {
    setCurrentSentiment(sentiment);
    setIsSingleAssociateOpen(true);
  };

  const getClosureGroup = (sentiment?: SentimentInfo | null) => {
    if (!sentiment) {
      return [];
    }

    return getAssociationGroupIds(sentiments, [sentiment.id])
      .map((id) => sentiments.find((item) => item.id === id))
      .filter((item): item is SentimentInfo => Boolean(item));
  };

  const openManualClosure = (sentiment: SentimentInfo) => {
    const group = getClosureGroup(sentiment);

    if (group.length > 1) {
      setCurrentSentiment(sentiment);
      setClosureSentimentIds(group.map((item) => item.id));
      setIsBatchClosureOpen(true);
      return;
    }

    confirmSentimentClosure(sentiment.id, '列表手动完结');
  };

  const handleConfirmBatchClosure = () => {
    closureSentimentIds.forEach((sentimentId) => {
      confirmSentimentClosure(sentimentId, '关联舆情一键完结');
    });
    setIsBatchClosureOpen(false);
    setClosureSentimentIds([]);
  };

  const closureDialogSentiment = currentSentiment || sentiments.find((item) => closureSentimentIds.includes(item.id));
  const closureDialogGroup = getClosureGroup(closureDialogSentiment);

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

  const getTaskStatusBadge = (sentimentId: string) => {
    const taskStatus = getSentimentTaskStatusById(sentimentId);
    const styles = {
      待指派: 'bg-gray-100 text-gray-700',
      处置中: 'bg-blue-100 text-blue-700',
      待完结: 'bg-amber-100 text-amber-700',
      已完结: 'bg-green-100 text-green-700',
    };

    return <Badge className={styles[taskStatus]}>{taskStatus}</Badge>;
  };

  return (
    <div className="space-y-5">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">舆情展示</h1>
        <p className="mt-1 text-sm text-slate-500">聚合事件线索、任务状态和报送进展，支持快速筛选、指派与关联。</p>
      </div>

      {/* 操作栏 */}
      <div className="rounded-3xl border border-white/70 bg-white/68 p-5 shadow-[0_18px_48px_rgba(32,97,165,0.10)] backdrop-blur-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsManualEntryOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            手动添加舆情
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" disabled={selectedIds.length === 0} onClick={openBatchReport}>
            <Send className="w-4 h-4 mr-2" />
            批量报送
          </Button>
          <Button variant="outline" disabled={selectedIds.length === 0} onClick={openBatchAssign}>
            <UserPlus className="w-4 h-4 mr-2" />
            批量指派
          </Button>
          <Button variant="outline" disabled={selectedIds.length < 2} onClick={openAssociateDialog}>
            <Link2 className="w-4 h-4 mr-2" />
            手动关联
          </Button>
          <Button
            variant="outline"
            disabled={selectedIds.length === 0}
            onClick={async () => {
              try {
                await deleteSentiments(selectedIds);
                setSelectedIds([]);
                setCurrentPage(1);
              } catch {
                // toast 已在 context 中提示
              }
            }}
          >
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
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/70 bg-white/65 p-5 shadow-[0_16px_38px_rgba(32,97,165,0.08)] backdrop-blur-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 rounded-full bg-blue-500" />总舆情数</div>
          <div className="text-3xl font-semibold tracking-tight text-slate-950">{sentiments.length}</div>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/65 p-5 shadow-[0_16px_38px_rgba(32,97,165,0.08)] backdrop-blur-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 rounded-full bg-rose-500" />未处理</div>
          <div className="text-3xl font-semibold tracking-tight text-rose-600">
            {sentiments.filter(s => s.status === '未处理').length}
          </div>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/65 p-5 shadow-[0_16px_38px_rgba(32,97,165,0.08)] backdrop-blur-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 rounded-full bg-sky-500" />跟进中</div>
          <div className="text-3xl font-semibold tracking-tight text-blue-600">
            {sentiments.filter(s => s.status === '跟进中').length}
          </div>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/65 p-5 shadow-[0_16px_38px_rgba(32,97,165,0.08)] backdrop-blur-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />已办结</div>
          <div className="text-3xl font-semibold tracking-tight text-emerald-600">
            {sentiments.filter(s => s.status === '已办结').length}
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-[0_22px_60px_rgba(32,97,165,0.10)] backdrop-blur-2xl">
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
              <TableHead className="min-w-[80px]">任务状态</TableHead>
              <TableHead className="min-w-[100px]">处理截止时间</TableHead>
              <TableHead className="min-w-[100px]">入库时间</TableHead>
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
                  <div className="space-y-1">
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
                    {sentiment.relatedEventIds?.length ? (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Link2 className="w-3 h-3" />
                        <span>{sentiment.primaryEventId === sentiment.id ? '主事件' : '关联事件'}</span>
                      </div>
                    ) : null}
                  </div>
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
                <TableCell>{getTaskStatusBadge(sentiment.id)}</TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600 whitespace-nowrap">{sentiment.deadline || sentiment.publishTime}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600 whitespace-nowrap">{sentiment.createdAt || sentiment.publishTime}</div>
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
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentSentiment(sentiment);
                        setReportSentimentIds([sentiment.id]);
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
                        setAssignSentimentIds([sentiment.id]);
                        setIsAssignOpen(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      指派
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openSingleAssociateDialog(sentiment)}
                    >
                      <Link2 className="w-4 h-4 mr-1" />
                      关联
                    </Button>
                    {sentiment.status !== '已办结' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600"
                        onClick={() => openManualClosure(sentiment)}
                      >
                        手动完结
                      </Button>
                    ) : null}
                    {getSentimentTaskStatusById(sentiment.id) === '待完结' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600"
                        onClick={() => {
                          setCurrentSentiment(sentiment);
                          setIsClosureOpen(true);
                        }}
                      >
                        完结
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 分页 */}
        <div className="flex items-center justify-between border-t border-slate-200/60 px-6 py-4">
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
        onSubmit={async (data) => {
          const newSentiment: SentimentInfo = {
            id: String(Date.now()),
            title: data.title || '无标题',
            source: data.source || '未知',
            publishTime: new Date().toISOString(),
            createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
            deadline: formatDateTimeLocal(data.deadline || new Date().toISOString()),
            content: data.title || '',
            summary: data.summary || '',
            channel: data.source || '未知',
            readCount: data.readCount || 0,
            commentCount: data.commentCount || 0,
            likeCount: data.likeCount || 0,
            shareCount: data.shareCount || 0,
            collectCount: data.collectCount || 0,
            emotionTrend: '中性',
            level: data.level || '轻微',
            status: '未处理',
            field: '抖音',
            unit: '默认单位',
            link: data.link || '',
            analysis: data.summary || '',
            createdBy: '当前用户',
            score: data.score,
            topicCategory: data.topicCategory,
            attentionCategory: data.attentionCategory,
            emotionCategory: data.emotionCategory,
            mediaSpreadCategory: data.mediaSpreadCategory,
            formatCategory: data.formatCategory,
            channelCategory: data.channelCategory,
            influenceCategory: data.influenceCategory,
          };
          await addSentiment(newSentiment);
          setCurrentPage(1);
        }}
      />

      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        sentimentIds={reportSentimentIds}
        onSuccess={(sentimentIds) => {
          if (reportSentimentIds.length > 1) {
            setSelectedIds([]);
          }
        }}
      />

      <AssignDialog
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        sentimentIds={assignSentimentIds}
        sentimentLevel={currentSentiment?.level || "一般"}
      />

      <SentimentEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        sentiment={currentSentiment}
        onSubmit={async (updates) => {
          if (currentSentiment) {
            await updateSentiment(currentSentiment.id, updates);
          }
        }}
      />

      <SentimentClosureDialog
        open={isClosureOpen}
        onOpenChange={setIsClosureOpen}
        sentimentTitle={currentSentiment?.title || ''}
        onConfirm={(note) => {
          if (currentSentiment) {
            confirmSentimentClosure(currentSentiment.id, note);
          }
        }}
      />

      <Dialog open={isAssociateOpen} onOpenChange={setIsAssociateOpen}>
        <DialogContent className="sm:max-w-[84rem] bg-white">
          <DialogHeader>
            <DialogTitle>手动关联舆情事件</DialogTitle>
            <DialogDescription>
              已选择 {selectedIds.length} 条舆情。请选择其中一条作为主事件，关联后可在详情页查看事件脉络。
            </DialogDescription>
          </DialogHeader>

          <RadioGroup value={primaryEventId} onValueChange={setPrimaryEventId} className="max-h-[360px] overflow-y-auto pr-2">
            {associationCandidates.map((sentiment) => (
              <Label
                key={sentiment.id}
                htmlFor={`primary-${sentiment.id}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              >
                <RadioGroupItem id={`primary-${sentiment.id}`} value={sentiment.id} className="mt-1" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 line-clamp-2">{sentiment.title}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {sentiment.publishTime} · {sentiment.source}
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssociateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAssociate} disabled={!primaryEventId}>
              确认关联
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBatchClosureOpen} onOpenChange={setIsBatchClosureOpen}>
        <DialogContent className="sm:max-w-[54rem] bg-white">
          <DialogHeader>
            <DialogTitle>关联舆情一键完结</DialogTitle>
            <DialogDescription>
              当前舆情已关联其他事件，系统已自动勾选全部关联舆情。确认后将同步置为已办结。
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-2">
            {closureDialogGroup.map((sentiment) => (
              <Label
                key={sentiment.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 hover:bg-blue-50/60"
              >
                <Checkbox
                  checked={closureSentimentIds.includes(sentiment.id)}
                  onCheckedChange={(checked) => {
                    setClosureSentimentIds((current) => (
                      checked
                        ? Array.from(new Set([...current, sentiment.id]))
                        : current.filter((id) => id !== sentiment.id)
                    ));
                  }}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 font-medium text-slate-900">
                    {sentiment.title}
                    {sentiment.id === (currentSentiment?.primaryEventId || currentSentiment?.id) ? (
                      <span className="ml-2 text-xs text-blue-600">主事件</span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    截止：{sentiment.deadline || sentiment.publishTime} · {sentiment.source}
                  </div>
                </div>
              </Label>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchClosureOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmBatchClosure} disabled={closureSentimentIds.length === 0}>
              完结已选 {closureSentimentIds.length} 条舆情
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SentimentPickerDialog
        open={isSingleAssociateOpen}
        onOpenChange={setIsSingleAssociateOpen}
        sentiments={sentiments.filter((item) => item.id !== currentSentiment?.id)}
        title={currentSentiment ? `为“${currentSentiment.title}”选择关联舆情` : '选择关联舆情'}
        onConfirm={(selectedSentiment) => {
          if (!currentSentiment || !selectedSentiment) {
            return;
          }

          associateEvents(
            [currentSentiment.id, selectedSentiment.id],
            currentSentiment.primaryEventId || currentSentiment.id,
          );
        }}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MobileFilterPanel } from '../components/ui/MobileFilterPanel';
import { MobileDataCard } from '../components/ui/MobileDataCard';
import { getActivityPage, createActivity, updateActivity, deleteActivity } from '../api/activity';
import type { Activity } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { key: 'festival', label: '节庆活动', color: 'text-terracotta-500 bg-terracotta-50 border-terracotta-200' },
  { key: 'picking', label: '采摘体验', color: 'text-sprout-500 bg-sprout-50 border-sprout-200' },
  { key: 'workshop', label: '体验课堂', color: 'text-bamboo-500 bg-bamboo-50 border-bamboo-200' },
  { key: 'market', label: '乡村市集', color: 'text-harvest-500 bg-harvest-50 border-harvest-200' },
  { key: 'competition', label: '赛事活动', color: 'text-purple-500 bg-purple-50 border-purple-200' },
];

const STATUS_OPTIONS = [
  { key: 'registering', label: '报名中', color: 'text-bamboo-500 bg-bamboo-50 border-bamboo-200' },
  { key: 'full', label: '已满员', color: 'text-harvest-500 bg-harvest-50 border-harvest-200' },
  { key: 'ongoing', label: '进行中', color: 'text-sprout-500 bg-sprout-50 border-sprout-200' },
  { key: 'ended', label: '已结束', color: 'text-gray-500 bg-gray-100 border-gray-200' },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORY_OPTIONS.map((c) => [c.key, c]));
const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.key, s]));

export default function Activities() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [list, setList] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选状态
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<Activity | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'festival',
    startTime: '',
    endTime: '',
    location: '',
    organizer: '',
    contactPhone: '',
    fee: 0,
    maxParticipants: 0,
    status: 'registering',
    tags: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getActivityPage({
        current,
        size: pageSize,
        keyword: filterKeyword || undefined,
        category: filterCategory || undefined,
        status: filterStatus || undefined,
      });
      if (res.code === 200 && res.data) {
        setList(res.data.records || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) {
      toast.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [current, pageSize]);

  const handleSearch = () => {
    setCurrent(1);
    fetchData();
  };

  const handleReset = () => {
    setFilterKeyword('');
    setFilterCategory('');
    setFilterStatus('');
    setCurrent(1);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'festival',
      startTime: '',
      endTime: '',
      location: '',
      organizer: '',
      contactPhone: '',
      fee: 0,
      maxParticipants: 0,
      status: 'registering',
      tags: '',
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Activity) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      organizer: item.organizer,
      contactPhone: item.contactPhone,
      fee: item.fee,
      maxParticipants: item.maxParticipants,
      status: item.status,
      tags: Array.isArray(item.tags) ? item.tags.join(',') : '',
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入活动标题');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (modalMode === 'edit' && editingItem) {
        await updateActivity(editingItem.id, payload);
        toast.success('更新成功');
      } else {
        await createActivity(payload as Activity);
        toast.success('创建成功');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({ message: '确定要删除该活动吗？此操作不可恢复。', type: 'danger' }))) return;
    try {
      await deleteActivity(id);
      toast.success('删除成功');
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!(await confirm({ message: `确定要删除选中的 ${selectedIds.length} 个活动吗？`, type: 'danger' }))) return;
    try {
      for (const id of selectedIds) { await deleteActivity(id); }
      setSelectedIds([]);
      fetchData();
      toast.success('批量删除成功');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '批量删除失败');
    }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? list.map(a => a.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {confirmDialog}

      {/* 筛选区域 */}
      <MobileFilterPanel title="活动筛选与操作">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 md:flex md:flex-wrap md:items-center md:gap-6">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <label className="text-sm text-gray-600">关键词</label>
              <input type="text" value={filterKeyword} onChange={(e) => setFilterKeyword(e.target.value)} placeholder="搜索活动标题" className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 md:w-48 md:py-1.5" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <label className="text-sm text-gray-600">分类</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-32 md:py-1.5">
                <option value="">全部</option>
                {CATEGORY_OPTIONS.map((c) => (<option key={c.key} value={c.key}>{c.label}</option>))}
              </select>
            </div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <label className="text-sm text-gray-600">状态</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-32 md:py-1.5">
                <option value="">全部</option>
                {STATUS_OPTIONS.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
            <button onClick={handleSearch} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white md:rounded md:py-1.5 md:flex md:items-center md:gap-1"><Search size={14} /> 查询</button>
            <button onClick={handleReset} className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 md:rounded md:py-1.5">重置</button>
            <button onClick={handleOpenAdd} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white md:rounded md:py-1.5 md:flex md:items-center md:gap-1"><Plus size={14} /> 新增活动</button>
            <button onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="rounded-2xl bg-terracotta-500 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5 md:flex md:items-center md:gap-1"><Trash2 size={14} /> 批量删除</button>
          </div>
        </div>
      </MobileFilterPanel>

      {/* 表格区域 */}
      <Card className="hidden p-0 overflow-hidden md:block">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-bold">
                <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={list.length > 0 && selectedIds.length === list.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
                <th className="py-3 px-4 text-center border border-gray-300">ID</th>
                <th className="py-3 px-4 text-center border border-gray-300">封面</th>
                <th className="py-3 px-4 text-center border border-gray-300">标题</th>
                <th className="py-3 px-4 text-center border border-gray-300">分类</th>
                <th className="py-3 px-4 text-center border border-gray-300">时间范围</th>
                <th className="py-3 px-4 text-center border border-gray-300">费用</th>
                <th className="py-3 px-4 text-center border border-gray-300">报名</th>
                <th className="py-3 px-4 text-center border border-gray-300">状态</th>
                <th className="py-3 px-4 text-center border border-gray-300">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {list.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.id}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    {item.coverImages && item.coverImages.length > 0 ? (
                      <img
                        src={item.coverImages[0]}
                        alt={item.title}
                        className="w-[60px] h-[40px] object-cover rounded mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400">无</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 max-w-[200px] truncate">
                    {item.title}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border ${
                        CATEGORY_MAP[item.category]?.color || ''
                      }`}
                    >
                      {CATEGORY_MAP[item.category]?.label || item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 whitespace-nowrap text-xs">
                    {item.startTime} ~ {item.endTime}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    {item.fee === 0 ? (
                      <span className="text-sprout-500 font-medium">免费</span>
                    ) : (
                      <span className="text-terracotta-500 font-medium">¥{item.fee}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className="text-bamboo-500">{item.currentParticipants}</span>
                    <span className="text-gray-400">/</span>
                    <span>{item.maxParticipants || '不限'}</span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border ${
                        STATUS_MAP[item.status]?.color || ''
                      }`}
                    >
                      {STATUS_MAP[item.status]?.label || item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="bg-bamboo-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <Edit size={12} /> 编辑
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-terracotta-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500 border border-gray-300">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 分页 */}
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <span className="mr-4">共 {total} 条</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrent(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white"
          >
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent(Math.max(1, current - 1))}
              disabled={current <= 1}
              className="text-gray-400 disabled:opacity-50"
            >
              &lt;
            </button>
            <span>
              {current}/{totalPages || 1}
            </span>
            <button
              onClick={() => setCurrent(Math.min(totalPages, current + 1))}
              disabled={current >= totalPages}
              className="text-gray-400 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </Card>


      {/* 移动端卡片列表 */}
      <div className="space-y-3 md:hidden">
        {loading && <Card className="p-4 text-center text-sm text-gray-400">加载中...</Card>}
        {!loading && list.length === 0 && <Card className="p-8 text-center text-sm text-gray-500">暂无数据</Card>}
        {list.map((item) => {
          const progress = item.maxParticipants ? Math.min(100, Math.round((item.currentParticipants / item.maxParticipants) * 100)) : 0;
          return (
            <MobileDataCard
              key={item.id}
              title={item.title}
              subtitle={`${item.startTime || ''} ~ ${item.endTime || ''}`}
              selected={selectedIds.includes(item.id)}
              onSelect={() => handleSelectOne(item.id)}
              tags={[
                <span key="cat" className={`rounded-full border px-2 py-0.5 text-[11px] ${CATEGORY_MAP[item.category]?.color || ''}`}>{CATEGORY_MAP[item.category]?.label || item.category}</span>,
                <span key="status" className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_MAP[item.status]?.color || ''}`}>{STATUS_MAP[item.status]?.label || item.status}</span>,
                item.fee === 0
                  ? <span key="fee" className="rounded-full border border-sprout-200 bg-sprout-50 px-2 py-0.5 text-[11px] text-sprout-500">免费</span>
                  : <span key="fee" className="rounded-full border border-terracotta-200 bg-terracotta-50 px-2 py-0.5 text-[11px] text-terracotta-500">¥{item.fee}</span>,
              ]}
              fields={[
                { label: '报名', value: `${item.currentParticipants}/${item.maxParticipants || '不限'}` },
                ...(item.maxParticipants ? [{ label: '进度', value: `${progress}%` }] : []),
              ]}
              actions={[
                { label: '编辑', onClick: () => handleOpenEdit(item), tone: 'primary' as const },
                { label: '删除', onClick: () => handleDelete(item.id), tone: 'danger' as const },
              ]}
            />
          );
        })}
      </div>

      <Card className="p-4 md:hidden">
        <div className="flex flex-col gap-3 text-sm text-gray-600">
          <div className="flex items-center justify-between"><span>共 {total} 条</span><span>{current}/{totalPages || 1}</span></div>
          <div className="flex items-center justify-between gap-3">
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="rounded border border-gray-300 bg-white px-3 py-2"><option value={10}>10条/页</option><option value={20}>20条/页</option><option value={50}>50条/页</option></select>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="rounded border border-gray-300 bg-white px-3 py-2 disabled:opacity-50">&lt;</button>
              <button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="rounded border border-gray-300 bg-white px-3 py-2 disabled:opacity-50">&gt;</button>
            </div>
          </div>
        </div>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'edit' ? '编辑活动' : '新增活动'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              活动标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请输入活动标题"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="请输入活动描述"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">活动分类</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">活动状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
              <input
                type="text"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="如：2026-04-01 09:00"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
              <input
                type="text"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                placeholder="如：2026-04-15 18:00"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">活动地点</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="请输入活动地点"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主办方</label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="请输入主办方名称"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="联系电话"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">费用 (¥)</label>
              <input
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                min={0}
                placeholder="0表示免费"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最大人数</label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                min={0}
                placeholder="0表示不限"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="多个标签用英文逗号分隔，如：赏花,摄影"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-bamboo-500 rounded hover:bg-bamboo-400 disabled:opacity-50"
            >
              {saving ? '保存中...' : '确定'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

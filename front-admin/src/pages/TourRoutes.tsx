import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { getRoutePage, createRoute, updateRoute, deleteRoute } from '../api/tourRoute';
import type { TourRoute } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  easy: { label: '简单', color: 'text-sprout-500 bg-sprout-50 border-sprout-200' },
  medium: { label: '中等', color: 'text-harvest-500 bg-harvest-50 border-harvest-200' },
  hard: { label: '困难', color: 'text-terracotta-500 bg-terracotta-50 border-terracotta-200' },
};

const STATUS_MAP: Record<number, string> = { 1: '启用', 0: '禁用' };

export default function TourRoutes() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [list, setList] = useState<TourRoute[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选状态
  const [filterKeyword, setFilterKeyword] = useState('');

  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<TourRoute | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    coverImage: '',
    description: '',
    days: 1,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    suitableCrowd: '',
    budgetMin: 0,
    budgetMax: 0,
    tags: '',
    isOfficial: false,
    status: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRoutePage({
        current,
        size: pageSize,
        keyword: filterKeyword || undefined,
      });
      if (res.code === 200 && res.data) {
        setList(res.data.records || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) {
      toast.error('获取路线列表失败');
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
    setCurrent(1);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      coverImage: '',
      description: '',
      days: 1,
      difficulty: 'easy',
      suitableCrowd: '',
      budgetMin: 0,
      budgetMax: 0,
      tags: '',
      isOfficial: false,
      status: 1,
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TourRoute) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      coverImage: item.coverImage,
      description: item.description,
      days: item.days,
      difficulty: item.difficulty,
      suitableCrowd: item.suitableCrowd,
      budgetMin: item.budgetMin,
      budgetMax: item.budgetMax,
      tags: Array.isArray(item.tags) ? item.tags.join(',') : '',
      isOfficial: item.isOfficial,
      status: item.status,
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入路线名称');
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
        await updateRoute(editingItem.id, payload);
        toast.success('更新成功');
      } else {
        await createRoute(payload as TourRoute);
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
    if (!(await confirm({ message: '确定要删除该旅游路线吗？此操作不可恢复。', type: 'danger' }))) return;
    try {
      await deleteRoute(id);
      toast.success('删除成功');
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!(await confirm({ message: `确定要删除选中的 ${selectedIds.length} 条路线吗？`, type: 'danger' }))) return;
    try {
      for (const id of selectedIds) { await deleteRoute(id); }
      setSelectedIds([]);
      fetchData();
      toast.success('批量删除成功');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '批量删除失败');
    }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? list.map(r => r.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {confirmDialog}

      {/* 筛选区域 */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">关键词</label>
            <input
              type="text"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              placeholder="搜索路线名称"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1"
          >
            <Search size={14} /> 查询
          </button>
          <button
            onClick={handleReset}
            className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm"
          >
            重置
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1"
          >
            <Plus size={14} /> 新增路线
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={selectedIds.length === 0}
            className="bg-terracotta-500 hover:bg-terracotta-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Trash2 size={14} /> 批量删除
          </button>
        </div>
      </Card>

      {/* 表格区域 */}
      <Card className="p-0 overflow-hidden">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-bold">
                <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={list.length > 0 && selectedIds.length === list.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
                <th className="py-3 px-4 text-center border border-gray-300">ID</th>
                <th className="py-3 px-4 text-center border border-gray-300">封面</th>
                <th className="py-3 px-4 text-center border border-gray-300">名称</th>
                <th className="py-3 px-4 text-center border border-gray-300">天数</th>
                <th className="py-3 px-4 text-center border border-gray-300">难度</th>
                <th className="py-3 px-4 text-center border border-gray-300">预算区间</th>
                <th className="py-3 px-4 text-center border border-gray-300">评分</th>
                <th className="py-3 px-4 text-center border border-gray-300">是否官方</th>
                <th className="py-3 px-4 text-center border border-gray-300">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {list.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.id}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.name}
                        className="w-[60px] h-[40px] object-cover rounded mx-auto"
                      />
                    ) : (
                      <span className="text-gray-400">无</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 max-w-[200px] truncate">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.days}天</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border ${
                        DIFFICULTY_MAP[item.difficulty]?.color || ''
                      }`}
                    >
                      {DIFFICULTY_MAP[item.difficulty]?.label || item.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    ¥{item.budgetMin} ~ ¥{item.budgetMax}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className="text-harvest-500 font-medium">{item.rating}</span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    {item.isOfficial ? (
                      <span className="px-2 py-0.5 rounded text-xs border text-bamboo-500 bg-bamboo-50 border-bamboo-200">
                        官方
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs border text-gray-500 bg-[#f4f4f5] border-[#e9e9eb]">
                        用户
                      </span>
                    )}
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

      {/* 新增/编辑弹窗 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'edit' ? '编辑旅游路线' : '新增旅游路线'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              路线名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入路线名称"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面图片</label>
            <input
              type="text"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="请输入封面图片URL"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            />
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                alt="预览"
                className="mt-2 w-32 h-20 object-cover rounded"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">路线描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="请输入路线描述"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">游玩天数</label>
              <select
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
              >
                <option value={1}>1天</option>
                <option value={2}>2天</option>
                <option value={3}>3天</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">难度等级</label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">适合人群</label>
              <input
                type="text"
                value={formData.suitableCrowd}
                onChange={(e) => setFormData({ ...formData, suitableCrowd: e.target.value })}
                placeholder="如：家庭出游、户外爱好者"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
              >
                <option value={1}>启用</option>
                <option value={0}>禁用</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最低预算 (¥)</label>
              <input
                type="number"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最高预算 (¥)</label>
              <input
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                min={0}
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
              placeholder="多个标签用英文逗号分隔，如：自然风光,人文历史"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">是否官方路线</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOfficial}
                onChange={(e) => setFormData({ ...formData, isOfficial: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bamboo-500"></div>
            </label>
            <span className="text-sm text-gray-500">{formData.isOfficial ? '是' : '否'}</span>
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

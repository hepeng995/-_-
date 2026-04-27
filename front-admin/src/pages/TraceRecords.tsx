import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../contexts/ToastContext';
import { getTracePage, createTraceRecord, updateTraceRecord, deleteTraceRecord, getBatches } from '../api/trace';
import { stageConfig } from '../mock/traceData';
import type { TraceRecord } from '../types';
import type { ProductBatch } from '../types';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';

export default function TraceRecords() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [records, setRecords] = useState<TraceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选条件
  const [filterProductId, setFilterProductId] = useState<number | ''>('');
  const [filterBatchNo, setFilterBatchNo] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [keyword, setKeyword] = useState('');

  // 批次数据
  const [batches, setBatches] = useState<ProductBatch[]>([]);

  // 弹窗
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<TraceRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    productId: 0,
    productName: '',
    batchNo: '',
    stage: '',
    title: '',
    description: '',
    location: '',
    operator: '',
    operatorType: '',
    operationDate: '',
  });

  // 获取批次数据
  useEffect(() => {
    getBatches().then(res => {
      if (res.code === 200 && res.data) {
        setBatches(res.data);
      }
    }).catch(() => {});
  }, []);

  // 获取溯源记录
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTracePage({
        current,
        size: pageSize,
        productId: filterProductId || undefined,
        batchNo: filterBatchNo || undefined,
        stage: filterStage || undefined,
      });
      if (res.code === 200 && res.data) {
        let filtered = res.data.records || [];
        // 关键词搜索（标题、描述、操作人）
        if (keyword) {
          const kw = keyword.toLowerCase();
          filtered = filtered.filter(
            r =>
              r.title.toLowerCase().includes(kw) ||
              r.description.toLowerCase().includes(kw) ||
              r.operator.toLowerCase().includes(kw)
          );
        }
        setRecords(filtered);
        setTotal(keyword ? filtered.length : res.data.total || 0);
      }
    } catch (e) {
      toast.error('获取溯源记录失败');
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
    setFilterProductId('');
    setFilterBatchNo('');
    setFilterStage('');
    setKeyword('');
    setCurrent(1);
  };

  // 派生：根据选中的产品过滤批次
  const filteredBatches = filterProductId
    ? batches.filter(b => b.productId === filterProductId)
    : batches;

  // 派生：所有唯一产品
  const uniqueProducts = Array.from(
    new Map(batches.map(b => [b.productId, b.productName])).entries()
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      productId: 0,
      productName: '',
      batchNo: '',
      stage: '',
      title: '',
      description: '',
      location: '',
      operator: '',
      operatorType: '',
      operationDate: '',
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TraceRecord) => {
    setEditingItem(item);
    setFormData({
      productId: item.productId,
      productName: item.productName,
      batchNo: item.batchNo,
      stage: item.stage,
      title: item.title,
      description: item.description,
      location: item.location,
      operator: item.operator,
      operatorType: item.operatorType,
      operationDate: item.operationDate,
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.productId || !formData.batchNo || !formData.stage || !formData.title) {
      toast.warning('请填写必填字段（产品、批次、环节、标题）');
      return;
    }
    setSaving(true);
    try {
      const record: TraceRecord = {
        id: editingItem?.id ?? 0,
        productId: formData.productId,
        productName: formData.productName,
        batchNo: formData.batchNo,
        stage: formData.stage,
        title: formData.title,
        description: formData.description,
        images: editingItem?.images || [],
        location: formData.location,
        operator: formData.operator,
        operatorType: formData.operatorType,
        operationDate: formData.operationDate,
        notes: editingItem?.notes || [],
        createdAt: editingItem?.createdAt || new Date().toISOString().split('T')[0],
      };

      if (modalMode === 'edit' && editingItem) {
        await updateTraceRecord(editingItem.id, record);
        toast.success('更新成功');
      } else {
        await createTraceRecord(record);
        toast.success('创建成功');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e?.message || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!await confirm({ message: '确定要删除该溯源记录吗？删除后不可恢复。', type: 'danger' })) return;
    try {
      await deleteTraceRecord(id);
      toast.success('删除成功');
      fetchData();
    } catch (e: any) {
      toast.error(e?.message || '删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm({ message: `确定要删除选中的 ${selectedIds.length} 条溯源记录吗？`, type: 'danger' })) return;
    try {
      for (const id of selectedIds) { await deleteTraceRecord(id); }
      setSelectedIds([]);
      fetchData();
      toast.success('批量删除成功');
    } catch (e: any) {
      toast.error(e?.message || '批量删除失败');
    }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? records.map(r => r.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  // 获取环节配置
  const getStageInfo = (stageKey: string) => {
    return stageConfig.find(s => s.key === stageKey);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {confirmDialog}

      {/* 筛选区域 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-bamboo-500" />
          <h2 className="text-base font-bold text-gray-800">溯源记录管理</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* 产品筛选 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">产品</label>
            <select
              value={filterProductId}
              onChange={(e) => {
                setFilterProductId(e.target.value ? Number(e.target.value) : '');
                setFilterBatchNo('');
              }}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            >
              <option value="">全部产品</option>
              {uniqueProducts.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          {/* 批次筛选 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">批次</label>
            <select
              value={filterBatchNo}
              onChange={(e) => setFilterBatchNo(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            >
              <option value="">全部批次</option>
              {filteredBatches.map(b => (
                <option key={b.id} value={b.batchNo}>{b.batchNo}</option>
              ))}
            </select>
          </div>

          {/* 环节筛选 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">环节</label>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            >
              <option value="">全部环节</option>
              {stageConfig.map(s => (
                <option key={s.key} value={s.key}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* 关键词搜索 */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索标题/描述/操作人"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            />
          </div>

          <button onClick={handleSearch} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1">
            <Search size={14} />查询
          </button>
          <button onClick={handleReset} className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm hover:text-bamboo-500 hover:border-bamboo-500 transition-colors">
            重置
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleOpenAdd} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1">
            <Plus size={14} />新增溯源记录
          </button>
          <button onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="bg-terracotta-500 hover:bg-terracotta-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
            <Trash2 size={14} />批量删除
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
                <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={records.length > 0 && selectedIds.length === records.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
                <th className="py-3 px-4 text-center border border-gray-300">ID</th>
                <th className="py-3 px-4 text-center border border-gray-300">环节</th>
                <th className="py-3 px-4 text-center border border-gray-300">标题</th>
                <th className="py-3 px-4 text-center border border-gray-300">操作日期</th>
                <th className="py-3 px-4 text-center border border-gray-300">地点</th>
                <th className="py-3 px-4 text-center border border-gray-300">操作人</th>
                <th className="py-3 px-4 text-center border border-gray-300">操作人类型</th>
                <th className="py-3 px-4 text-center border border-gray-300">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {records.map(item => {
                const stage = getStageInfo(item.stage);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                    <td className="py-3 px-4 text-center border border-gray-300">{item.id}</td>
                    <td className="py-3 px-4 text-center border border-gray-300">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: stage?.color || '#999' }}
                      >
                        {stage?.name || item.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center border border-gray-300 max-w-[200px] truncate" title={item.title}>
                      {item.title}
                    </td>
                    <td className="py-3 px-4 text-center border border-gray-300">{item.operationDate}</td>
                    <td className="py-3 px-4 text-center border border-gray-300 max-w-[160px] truncate" title={item.location}>
                      {item.location}
                    </td>
                    <td className="py-3 px-4 text-center border border-gray-300">{item.operator}</td>
                    <td className="py-3 px-4 text-center border border-gray-300">{item.operatorType}</td>
                    <td className="py-3 px-4 text-center border border-gray-300">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="bg-bamboo-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-bamboo-400 transition-colors"
                        >
                          <Edit size={12} />编辑
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-terracotta-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-terracotta-400 transition-colors"
                        >
                          <Trash2 size={12} />删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 border border-gray-300">
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
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }}
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
              className="text-gray-400 disabled:opacity-50 px-2 py-1 hover:text-bamboo-500 transition-colors"
            >
              &lt;
            </button>
            <span>{current}/{totalPages || 1}</span>
            <button
              onClick={() => setCurrent(Math.min(totalPages, current + 1))}
              disabled={current >= totalPages}
              className="text-gray-400 disabled:opacity-50 px-2 py-1 hover:text-bamboo-500 transition-colors"
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
        title={modalMode === 'edit' ? '编辑溯源记录' : '新增溯源记录'}
        className="max-w-lg"
      >
        <div className="space-y-4">
          {/* 产品选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              产品 <span className="text-terracotta-500">*</span>
            </label>
            <select
              value={formData.productId}
              onChange={(e) => {
                const pid = Number(e.target.value);
                const productName = batches.find(b => b.productId === pid)?.productName || '';
                const batch = batches.find(b => b.productId === pid);
                setFormData({
                  ...formData,
                  productId: pid,
                  productName,
                  batchNo: batch?.batchNo || '',
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            >
              <option value={0}>请选择产品</option>
              {uniqueProducts.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          {/* 批次号（自动填充） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              批次号 <span className="text-terracotta-500">*</span>
            </label>
            <select
              value={formData.batchNo}
              onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            >
              <option value="">请选择批次</option>
              {batches
                .filter(b => !formData.productId || b.productId === formData.productId)
                .map(b => (
                  <option key={b.id} value={b.batchNo}>{b.batchNo}</option>
                ))}
            </select>
          </div>

          {/* 环节选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              环节 <span className="text-terracotta-500">*</span>
            </label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            >
              <option value="">请选择环节</option>
              {stageConfig.map(s => (
                <option key={s.key} value={s.key}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题 <span className="text-terracotta-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请输入标题"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入描述"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 resize-none"
            />
          </div>

          {/* 地点 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="请输入地点"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            />
          </div>

          {/* 操作人 + 操作人类型 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">操作人</label>
              <input
                type="text"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                placeholder="请输入操作人"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">操作人类型</label>
              <input
                type="text"
                value={formData.operatorType}
                onChange={(e) => setFormData({ ...formData, operatorType: e.target.value })}
                placeholder="如：农户、企业"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
              />
            </div>
          </div>

          {/* 操作日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">操作日期</label>
            <input
              type="date"
              value={formData.operationDate}
              onChange={(e) => setFormData({ ...formData, operationDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
            />
          </div>

          {/* 按钮组 */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:text-bamboo-500 hover:border-bamboo-500 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-bamboo-500 rounded hover:bg-bamboo-400 disabled:opacity-50 transition-colors"
            >
              {saving ? '保存中...' : '确定'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

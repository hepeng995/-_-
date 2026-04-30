import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MobileFilterPanel } from '../components/ui/MobileFilterPanel';
import { MobileBatchActionBar } from '../components/ui/MobileBatchActionBar';
import { MobileDataCard } from '../components/ui/MobileDataCard';
import * as productApi from '../api/product';
import type { ProductCategory } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

export default function ProductCategories() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterName, setFilterName] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<ProductCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', sortOrder: 1, status: 1 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProductCategoriesPage({ current, size: pageSize, name: filterName || undefined });
      if (res.code === 200 && res.data) { setCategories(res.data.records || []); setTotal(res.data.total || 0); }
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [current, pageSize]);

  const handleOpenAdd = () => { setEditingItem(null); setFormData({ name: '', description: '', sortOrder: 1, status: 1 }); setModalMode('add'); setIsModalOpen(true); };
  const handleOpenEdit = (item: ProductCategory) => { setEditingItem(item); setFormData({ name: item.name, description: item.description, sortOrder: item.sortOrder, status: item.status }); setModalMode('edit'); setIsModalOpen(true); };

  const handleSave = async () => {
    if (!formData.name) return; setSaving(true);
    try {
      if (modalMode === 'edit' && editingItem) await productApi.updateProductCategory(editingItem.id, formData);
      else await productApi.createProductCategory(formData);
      setIsModalOpen(false); fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => { if (!await confirm({ message: '确定要删除吗？', type: 'danger' })) return; try { await productApi.deleteProductCategory(id); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '删除失败'); } };

  const toggleStatus = async (item: ProductCategory) => { try { await productApi.updateProductCategoryStatus(item.id, item.status === 1 ? 0 : 1); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); } };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm({ message: `确定要删除选中的 ${selectedIds.length} 个分类吗？`, type: 'danger' })) return;
    try { await productApi.batchDeleteProductCategories(selectedIds); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '批量删除失败'); }
  };
  const handleBatchStatus = async (status: number) => {
    if (selectedIds.length === 0) return;
    try { await productApi.batchUpdateProductCategoryStatus(selectedIds, status); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? categories.map(c => c.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {confirmDialog}
      <MobileFilterPanel title="分类筛选与操作">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 md:flex md:flex-wrap md:items-center md:gap-6">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">分类名称</label><input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="搜索" className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 md:w-48 md:py-1.5" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
            <button onClick={() => { setCurrent(1); fetchData(); }} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white hover:bg-bamboo-400 md:rounded md:py-1.5">查询</button>
            <button onClick={() => { setFilterName(''); setCurrent(1); }} className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 md:rounded md:py-1.5">重置</button>
            <button onClick={handleOpenAdd} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white hover:bg-bamboo-400 md:rounded md:py-1.5">添加分类</button>
            <button onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="rounded-2xl bg-terracotta-500 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量删除</button>
            <button onClick={() => handleBatchStatus(1)} disabled={selectedIds.length === 0} className="rounded-2xl bg-sprout-500 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量启用</button>
            <button onClick={() => handleBatchStatus(0)} disabled={selectedIds.length === 0} className="rounded-2xl bg-harvest-500 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量禁用</button>
          </div>
        </div>
      </MobileFilterPanel>

      <Card className="hidden overflow-hidden p-0 md:block">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead><tr className="bg-gray-50 text-gray-500 text-sm font-bold">
              <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={categories.length > 0 && selectedIds.length === categories.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
              <th className="py-3 px-4 text-center border border-gray-300">分类名称</th>
              <th className="py-3 px-4 text-center border border-gray-300">描述</th>
              <th className="py-3 px-4 text-center border border-gray-300">排序</th>
              <th className="py-3 px-4 text-center border border-gray-300">状态</th>
              <th className="py-3 px-4 text-center border border-gray-300">创建时间</th>
              <th className="py-3 px-4 text-center border border-gray-300">操作</th>
            </tr></thead>
            <tbody className="text-sm text-gray-600">
              {categories.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.name}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.description}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.sortOrder}</td>
                  <td className="py-3 px-4 text-center border border-gray-300"><span className={`px-2 py-0.5 rounded text-xs border ${item.status === 1 ? 'text-sprout-500 bg-sprout-50 border-sprout-200' : 'text-terracotta-500 bg-terracotta-50 border-terracotta-200'}`}>{item.status === 1 ? '启用' : '禁用'}</span></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.createdAt || '-'}</td>
                  <td className="py-3 px-4 text-center border border-gray-300"><div className="flex items-center justify-center gap-2"><button onClick={() => handleOpenEdit(item)} className="bg-bamboo-500 text-white px-3 py-1 rounded text-xs">编辑</button><button onClick={() => toggleStatus(item)} className="bg-harvest-500 text-white px-3 py-1 rounded text-xs">{item.status === 1 ? '禁用' : '启用'}</button><button onClick={() => handleDelete(item.id)} className="bg-terracotta-500 text-white px-3 py-1 rounded text-xs">删除</button></div></td>
                </tr>
              ))}
              {categories.length === 0 && !loading && <tr><td colSpan={7} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <span className="mr-4">共 {total} 条</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white"><option value={10}>10条/页</option><option value={20}>20条/页</option></select>
          <div className="flex items-center gap-2"><button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="text-gray-400 disabled:opacity-50">&lt;</button><span>{current}/{totalPages || 1}</span><button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="text-gray-400 disabled:opacity-50">&gt;</button></div>
        </div>
      </Card>

      <div className="space-y-3 md:hidden">
        {loading && <Card className="p-4 text-center text-sm text-gray-400">加载中...</Card>}
        {!loading && categories.length === 0 && <Card className="p-8 text-center text-sm text-gray-500">暂无数据</Card>}
        {categories.map((item) => (
          <MobileDataCard
            key={item.id}
            title={item.name}
            subtitle={item.createdAt || '暂无创建时间'}
            selected={selectedIds.includes(item.id)}
            onSelect={() => handleSelectOne(item.id)}
            tags={[
              <span key="status" className={`rounded-full border px-2 py-0.5 text-[11px] ${item.status === 1 ? 'border-sprout-200 bg-sprout-50 text-sprout-500' : 'border-terracotta-200 bg-terracotta-50 text-terracotta-500'}`}>
                {item.status === 1 ? '启用' : '禁用'}
              </span>,
            ]}
            fields={[
              { label: '排序', value: item.sortOrder },
              { label: '描述', value: item.description || '-', fullWidth: true },
            ]}
            actions={[
              { label: '编辑', onClick: () => handleOpenEdit(item), tone: 'primary' },
              { label: item.status === 1 ? '禁用' : '启用', onClick: () => toggleStatus(item), tone: 'warning' },
              { label: '删除', onClick: () => handleDelete(item.id), tone: 'danger' },
            ]}
          />
        ))}
      </div>

      <Card className="p-4 md:hidden">
        <div className="flex flex-col gap-3 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>共 {total} 条</span>
            <span>{current}/{totalPages || 1}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="rounded border border-gray-300 bg-white px-3 py-2"><option value={10}>10条/页</option><option value={20}>20条/页</option></select>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="rounded-2xl border border-gray-200 px-3 py-2 disabled:opacity-50">&lt;</button>
              <button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="rounded-2xl border border-gray-200 px-3 py-2 disabled:opacity-50">&gt;</button>
            </div>
          </div>
        </div>
      </Card>

      <MobileBatchActionBar count={selectedIds.length}>
        <button onClick={handleBatchDelete} className="rounded-full bg-terracotta-500 px-3 py-2 text-xs font-medium text-white">删除</button>
        <button onClick={() => handleBatchStatus(1)} className="rounded-full bg-sprout-500 px-3 py-2 text-xs font-medium text-white">启用</button>
        <button onClick={() => handleBatchStatus(0)} className="rounded-full bg-harvest-500 px-3 py-2 text-xs font-medium text-white">禁用</button>
      </MobileBatchActionBar>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'edit' ? '编辑分类' : '新增分类'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">分类名称</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 resize-y"></textarea></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">排序</label><input type="number" value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">状态</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded bg-white"><option value={1}>启用</option><option value={0}>禁用</option></select></div>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <button onClick={() => setIsModalOpen(false)} className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 sm:w-auto sm:rounded">取消</button>
            <button onClick={handleSave} disabled={saving} className="w-full rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white disabled:opacity-50 sm:w-auto sm:rounded">{saving ? '保存中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

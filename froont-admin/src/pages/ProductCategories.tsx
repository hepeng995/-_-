import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {confirmDialog}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">分类名称</label><input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="搜索" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-[#409eff]" /></div>
          <button onClick={() => { setCurrent(1); fetchData(); }} className="bg-[#409eff] hover:bg-[#66b1ff] text-white px-4 py-1.5 rounded text-sm">查询</button>
          <button onClick={() => { setFilterName(''); setCurrent(1); }} className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm">重置</button>
        </div>
        <button onClick={handleOpenAdd} className="bg-[#409eff] hover:bg-[#66b1ff] text-white px-4 py-1.5 rounded text-sm">添加分类</button>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead><tr className="bg-[#f8f8f9] text-[#909399] text-sm font-bold">
              <th className="py-3 px-4 text-center border border-gray-300">分类名称</th>
              <th className="py-3 px-4 text-center border border-gray-300">描述</th>
              <th className="py-3 px-4 text-center border border-gray-300">排序</th>
              <th className="py-3 px-4 text-center border border-gray-300">状态</th>
              <th className="py-3 px-4 text-center border border-gray-300">创建时间</th>
              <th className="py-3 px-4 text-center border border-gray-300">操作</th>
            </tr></thead>
            <tbody className="text-sm text-[#606266]">
              {categories.map(item => (
                <tr key={item.id} className="hover:bg-[#f5f7fa]">
                  <td className="py-3 px-4 text-center border border-gray-300">{item.name}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.description}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.sortOrder}</td>
                  <td className="py-3 px-4 text-center border border-gray-300"><span className={`px-2 py-0.5 rounded text-xs border ${item.status === 1 ? 'text-[#67c23a] bg-[#f0f9eb] border-[#e1f3d8]' : 'text-[#f56c6c] bg-[#fef0f0] border-[#fde2e2]'}`}>{item.status === 1 ? '启用' : '禁用'}</span></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.createdAt || '-'}</td>
                  <td className="py-3 px-4 text-center border border-gray-300"><div className="flex items-center justify-center gap-2"><button onClick={() => handleOpenEdit(item)} className="bg-[#409eff] text-white px-3 py-1 rounded text-xs">编辑</button><button onClick={() => toggleStatus(item)} className="bg-[#e6a23c] text-white px-3 py-1 rounded text-xs">{item.status === 1 ? '禁用' : '启用'}</button><button onClick={() => handleDelete(item.id)} className="bg-[#f56c6c] text-white px-3 py-1 rounded text-xs">删除</button></div></td>
                </tr>
              ))}
              {categories.length === 0 && !loading && <tr><td colSpan={6} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-[#606266]">
          <span className="mr-4">共 {total} 条</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white"><option value={10}>10条/页</option><option value={20}>20条/页</option></select>
          <div className="flex items-center gap-2"><button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="text-gray-400 disabled:opacity-50">&lt;</button><span>{current}/{totalPages || 1}</span><button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="text-gray-400 disabled:opacity-50">&gt;</button></div>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'edit' ? '编辑分类' : '新增分类'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">分类名称</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff] resize-y"></textarea></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">排序</label><input type="number" value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">状态</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded bg-white"><option value={1}>启用</option><option value={0}>禁用</option></select></div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-[#409eff] rounded disabled:opacity-50">{saving ? '保存中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

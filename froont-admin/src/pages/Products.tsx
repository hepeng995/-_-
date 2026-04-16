import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import * as productApi from '../api/product';
import type { Product, ProductCategory } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

export default function Products() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', categoryId: 0, price: 0, originalPrice: 0, stock: 0, unit: '个', origin: '', description: '', coverImage: '', isFeatured: false, status: 1 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProductPage({ current, size: pageSize, name: filterName || undefined, categoryId: filterCategory ? Number(filterCategory) : undefined, status: filterStatus ? (filterStatus === '上架' ? 1 : 0) : undefined });
      if (res.code === 200 && res.data) { setProducts(res.data.records || []); setTotal(res.data.total || 0); }
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [current, pageSize]);
  useEffect(() => { productApi.getProductCategories().then(res => { if (res.code === 200 && res.data) setCategories(res.data); }).catch(() => {}); }, []);

  const handleSearch = () => { setCurrent(1); fetchData(); };
  const handleReset = () => { setFilterName(''); setFilterCategory(''); setFilterStatus(''); setCurrent(1); };
  const handleOpenAdd = () => { setEditingItem(null); setFormData({ name: '', categoryId: 0, price: 0, originalPrice: 0, stock: 0, unit: '个', origin: '', description: '', coverImage: '', isFeatured: false, status: 1 }); setModalMode('add'); setIsModalOpen(true); };
  const handleOpenEdit = (item: Product) => { setEditingItem(item); setFormData({ name: item.name, categoryId: item.categoryId, price: item.price, originalPrice: item.originalPrice, stock: item.stock, unit: item.unit, origin: item.origin || '', description: item.description, coverImage: item.coverImage, isFeatured: item.isFeatured, status: item.status }); setModalMode('edit'); setIsModalOpen(true); };

  const handleSave = async () => {
    if (!formData.name) return; setSaving(true);
    try {
      if (modalMode === 'edit' && editingItem) await productApi.updateProduct(editingItem.id, formData as any);
      else await productApi.createProduct(formData as any);
      setIsModalOpen(false); fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => { if (!await confirm({ message: '确定要删除吗？', type: 'danger' })) return; try { await productApi.deleteProduct(id); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '删除失败'); } };

  const totalPages = Math.ceil(total / pageSize);
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  return (
    <div className="space-y-6">
      {confirmDialog}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">商品名称</label><input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="搜索" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-[#409eff]" /></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">分类</label><select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white"><option value="">全部</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">状态</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white"><option value="">全部</option><option value="上架">上架</option><option value="下架">下架</option></select></div>
          <button onClick={handleSearch} className="bg-[#409eff] hover:bg-[#66b1ff] text-white px-4 py-1.5 rounded text-sm">查询</button>
          <button onClick={handleReset} className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm">重置</button>
        </div>
        <button onClick={handleOpenAdd} className="bg-[#409eff] hover:bg-[#66b1ff] text-white px-4 py-1.5 rounded text-sm">添加商品</button>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead><tr className="bg-[#f8f8f9] text-[#909399] text-sm font-bold">
              <th className="py-3 px-4 text-center border border-gray-300">商品名称</th>
              <th className="py-3 px-4 text-center border border-gray-300">分类</th>
              <th className="py-3 px-4 text-center border border-gray-300">价格</th>
              <th className="py-3 px-4 text-center border border-gray-300">库存</th>
              <th className="py-3 px-4 text-center border border-gray-300">销量</th>
              <th className="py-3 px-4 text-center border border-gray-300">状态</th>
              <th className="py-3 px-4 text-center border border-gray-300">创建时间</th>
              <th className="py-3 px-4 text-center border border-gray-300">操作</th>
            </tr></thead>
            <tbody className="text-sm text-[#606266]">
              {products.map(item => (
                <tr key={item.id} className="hover:bg-[#f5f7fa]">
                  <td className="py-3 px-4 text-center border border-gray-300">{item.name}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{catMap[item.categoryId] || item.categoryName || '-'}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">¥{item.price}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.stock}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.salesCount}</td>
                  <td className="py-3 px-4 text-center border border-gray-300"><span className={`px-2 py-0.5 rounded text-xs border ${item.status === 1 ? 'text-[#67c23a] bg-[#f0f9eb] border-[#e1f3d8]' : 'text-[#f56c6c] bg-[#fef0f0] border-[#fde2e2]'}`}>{item.status === 1 ? '上架' : '下架'}</span></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.createdAt}</td>
                  <td className="py-3 px-4 text-center border border-gray-300"><div className="flex items-center justify-center gap-2"><button onClick={() => handleOpenEdit(item)} className="bg-[#409eff] text-white px-3 py-1 rounded text-xs">编辑</button><button onClick={() => handleDelete(item.id)} className="bg-[#f56c6c] text-white px-3 py-1 rounded text-xs">删除</button></div></td>
                </tr>
              ))}
              {products.length === 0 && !loading && <tr><td colSpan={8} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-[#606266]">
          <span className="mr-4">共 {total} 条</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white"><option value={10}>10条/页</option><option value={20}>20条/页</option><option value={50}>50条/页</option></select>
          <div className="flex items-center gap-2"><button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="text-gray-400 disabled:opacity-50">&lt;</button><span>{current}/{totalPages || 1}</span><button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="text-gray-400 disabled:opacity-50">&gt;</button></div>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'edit' ? '编辑商品' : '新增商品'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">分类</label><select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded bg-white"><option value={0}>请选择</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">价格</label><input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">原价</label><input type="number" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">库存</label><input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">单位</label><input type="text" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">产地</label><input type="text" value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">状态</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded bg-white"><option value={1}>上架</option><option value={0}>下架</option></select></div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-[#409eff] rounded hover:bg-[#66b1ff] disabled:opacity-50">{saving ? '保存中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

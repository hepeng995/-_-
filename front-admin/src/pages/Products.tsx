import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MobileFilterPanel } from '../components/ui/MobileFilterPanel';
import { MobileBatchActionBar } from '../components/ui/MobileBatchActionBar';
import { MobileDataCard } from '../components/ui/MobileDataCard';
import * as productApi from '../api/product';
import * as fileApi from '../api/file';
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm({ message: `确定要删除选中的 ${selectedIds.length} 个商品吗？`, type: 'danger' })) return;
    try { await productApi.batchDeleteProducts(selectedIds); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '批量删除失败'); }
  };
  const handleBatchStatus = async (status: number) => {
    if (selectedIds.length === 0) return;
    try { await productApi.batchUpdateProductStatus(selectedIds, status); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? products.map(p => p.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const res: any = await fileApi.uploadFile(file);
      const url = res?.data?.data?.url || res?.data?.url;
      if (url) setFormData((f) => ({ ...f, coverImage: url }));
      else toast.error('上传失败');
    } catch { toast.error('上传失败'); }
  };

  const handleQuickStock = async (item: Product) => {
    const input = window.prompt(`修改"${item.name}"的库存（当前：${item.stock}）：`, String(item.stock));
    if (input === null) return;
    const next = Number(input);
    if (isNaN(next) || next < 0) { toast.error('库存必须为非负数'); return; }
    try {
      await productApi.updateProductStock(item.id, next);
      toast.success('库存已更新');
      fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || '更新失败'); }
  };

  const totalPages = Math.ceil(total / pageSize);
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  return (
    <div className="space-y-6">
      {confirmDialog}
      <MobileFilterPanel title="商品筛选与操作">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 md:flex md:flex-wrap md:items-center md:gap-6">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">商品名称</label><input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="搜索" className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 md:w-48 md:py-1.5" /></div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">分类</label><select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-32 md:py-1.5"><option value="">全部</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">状态</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-32 md:py-1.5"><option value="">全部</option><option value="上架">上架</option><option value="下架">下架</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
            <button onClick={handleSearch} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white hover:bg-bamboo-400 md:rounded md:py-1.5">查询</button>
            <button onClick={handleReset} className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 md:rounded md:py-1.5">重置</button>
            <button onClick={handleOpenAdd} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white hover:bg-bamboo-400 md:rounded md:py-1.5">添加商品</button>
            <button onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="rounded-2xl bg-terracotta-500 px-4 py-2 text-sm text-white hover:bg-terracotta-400 disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量删除</button>
            <button onClick={() => handleBatchStatus(1)} disabled={selectedIds.length === 0} className="rounded-2xl bg-sprout-500 px-4 py-2 text-sm text-white hover:bg-sprout-400 disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量上架</button>
            <button onClick={() => handleBatchStatus(0)} disabled={selectedIds.length === 0} className="rounded-2xl bg-harvest-500 px-4 py-2 text-sm text-white hover:bg-harvest-400 disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量下架</button>
          </div>
        </div>
      </MobileFilterPanel>

      <Card className="hidden overflow-hidden p-0 md:block">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead><tr className="bg-gray-50 text-gray-500 text-sm font-bold">
              <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={products.length > 0 && selectedIds.length === products.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
              <th className="py-3 px-4 text-center border border-gray-300">商品名称</th>
              <th className="py-3 px-4 text-center border border-gray-300">分类</th>
              <th className="py-3 px-4 text-center border border-gray-300">价格</th>
              <th className="py-3 px-4 text-center border border-gray-300">库存</th>
              <th className="py-3 px-4 text-center border border-gray-300">销量</th>
              <th className="py-3 px-4 text-center border border-gray-300">状态</th>
              <th className="py-3 px-4 text-center border border-gray-300">创建时间</th>
              <th className="py-3 px-4 text-center border border-gray-300">操作</th>
            </tr></thead>
            <tbody className="text-sm text-gray-600">
              {products.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.name}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{catMap[item.categoryId] || item.categoryName || '-'}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">¥{item.price}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.stock}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.salesCount}</td>
                  <td className="py-3 px-4 text-center border border-gray-300"><span className={`px-2 py-0.5 rounded text-xs border ${item.status === 1 ? 'text-sprout-500 bg-sprout-50 border-sprout-200' : 'text-terracotta-500 bg-terracotta-50 border-terracotta-200'}`}>{item.status === 1 ? '上架' : '下架'}</span></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.createdAt}</td>
                  <td className="py-3 px-4 text-center border border-gray-300"><div className="flex items-center justify-center gap-2"><button onClick={() => handleOpenEdit(item)} className="bg-bamboo-500 text-white px-3 py-1 rounded text-xs">编辑</button><button onClick={() => handleQuickStock(item)} className="bg-harvest-500 text-white px-3 py-1 rounded text-xs">改库存</button><button onClick={() => handleDelete(item.id)} className="bg-terracotta-500 text-white px-3 py-1 rounded text-xs">删除</button></div></td>
                </tr>
              ))}
              {products.length === 0 && !loading && <tr><td colSpan={9} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <span className="mr-4">共 {total} 条</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white"><option value={10}>10条/页</option><option value={20}>20条/页</option><option value={50}>50条/页</option></select>
          <div className="flex items-center gap-2"><button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="text-gray-400 disabled:opacity-50">&lt;</button><span>{current}/{totalPages || 1}</span><button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="text-gray-400 disabled:opacity-50">&gt;</button></div>
        </div>
      </Card>

      <div className="space-y-3 md:hidden">
        {loading && <Card className="p-4 text-center text-sm text-gray-400">加载中...</Card>}
        {!loading && products.length === 0 && <Card className="p-8 text-center text-sm text-gray-500">暂无数据</Card>}
        {products.map(item => (
          <MobileDataCard
            key={item.id}
            title={item.name}
            subtitle={item.createdAt ? `创建时间：${item.createdAt}` : '暂无创建时间'}
            selected={selectedIds.includes(item.id)}
            onSelect={() => handleSelectOne(item.id)}
            tags={[
              <span key="category" className="rounded-full border border-bamboo-200 bg-bamboo-50 px-2 py-0.5 text-[11px] text-bamboo-500">
                {catMap[item.categoryId] || item.categoryName || '未分类'}
              </span>,
              <span key="status" className={`rounded-full border px-2 py-0.5 text-[11px] ${item.status === 1 ? 'border-sprout-200 bg-sprout-50 text-sprout-500' : 'border-terracotta-200 bg-terracotta-50 text-terracotta-500'}`}>
                {item.status === 1 ? '上架' : '下架'}
              </span>,
            ]}
            fields={[
              { label: '价格', value: `¥${item.price}` },
              { label: '库存', value: item.stock },
              { label: '销量', value: item.salesCount },
            ]}
            details={[
              { label: '原价', value: item.originalPrice ? `¥${item.originalPrice}` : '-' },
              { label: '单位', value: item.unit || '-' },
              { label: '产地', value: item.origin || '-', fullWidth: true },
              { label: '商品描述', value: item.description || '-', fullWidth: true },
            ]}
            actions={[
              { label: '编辑', onClick: () => handleOpenEdit(item), tone: 'primary' },
              { label: '改库存', onClick: () => handleQuickStock(item), tone: 'primary' },
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
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="rounded border border-gray-300 bg-white px-3 py-2">
              <option value={10}>10条/页</option><option value={20}>20条/页</option><option value={50}>50条/页</option>
            </select>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="rounded-2xl border border-gray-200 px-3 py-2 disabled:opacity-50">&lt;</button>
              <button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="rounded-2xl border border-gray-200 px-3 py-2 disabled:opacity-50">&gt;</button>
            </div>
          </div>
        </div>
      </Card>

      <MobileBatchActionBar count={selectedIds.length}>
        <button onClick={handleBatchDelete} className="rounded-full bg-terracotta-500 px-3 py-2 text-xs font-medium text-white">删除</button>
        <button onClick={() => handleBatchStatus(1)} className="rounded-full bg-sprout-500 px-3 py-2 text-xs font-medium text-white">上架</button>
        <button onClick={() => handleBatchStatus(0)} className="rounded-full bg-harvest-500 px-3 py-2 text-xs font-medium text-white">下架</button>
      </MobileBatchActionBar>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'edit' ? '编辑商品' : '新增商品'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">分类</label><select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded bg-white"><option value={0}>请选择</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">价格</label><input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">原价</label><input type="number" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">库存</label><input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">单位</label><input type="text" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">产地</label><input type="text" value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面图片</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {formData.coverImage && <img src={formData.coverImage} alt="" className="h-20 w-20 rounded object-cover border border-gray-200" />}
              <label className="cursor-pointer rounded border border-gray-300 bg-white px-4 py-2 text-center text-sm text-gray-600 hover:text-bamboo-500">
                选择文件上传<input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
              <input type="text" value={formData.coverImage} onChange={(e) => setFormData({...formData, coverImage: e.target.value})} placeholder="或直接粘贴图片 URL" className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商品描述</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} placeholder="支持纯文本/HTML 标签（如 <p>、<strong>、<br>）" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 resize-y" />
            <div className="mt-1 text-[11px] text-gray-400">提示：富文本内容会按 v-html 直接渲染至商品详情页，请避免不可信来源。</div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">是否精选</label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-bamboo-500" />
                <span className="text-sm text-gray-600">{formData.isFeatured ? '精选 - 在首页推荐位展示' : '普通商品'}</span>
              </label>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">状态</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded bg-white"><option value={1}>上架</option><option value={0}>下架</option></select></div>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <button onClick={() => setIsModalOpen(false)} className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 sm:w-auto sm:rounded">取消</button>
            <button onClick={handleSave} disabled={saving} className="w-full rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white hover:bg-bamboo-400 disabled:opacity-50 sm:w-auto sm:rounded">{saving ? '保存中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MobileFilterPanel } from '../components/ui/MobileFilterPanel';
import { MobileBatchActionBar } from '../components/ui/MobileBatchActionBar';
import { MobileDataCard } from '../components/ui/MobileDataCard';
import * as attractionApi from '../api/attraction';
import * as fileApi from '../api/file';
import type { Attraction, AttractionCategory } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

export default function Attractions() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<AttractionCategory[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<Attraction | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', categoryId: 0, address: '', ticketPrice: 0, description: '', coverImage: '', status: 1, longitude: 0, latitude: 0, trafficGuide: '', openingHours: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await attractionApi.getAttractionPage({
        current, size: pageSize,
        name: filterName || undefined,
        categoryId: filterCategory ? Number(filterCategory) : undefined,
        status: filterStatus ? (filterStatus === '启用' ? 1 : 0) : undefined,
      });
      if (res.code === 200 && res.data) { setAttractions(res.data.records || []); setTotal(res.data.total || 0); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try { const res = await attractionApi.getAttractionCategories(); if (res.code === 200 && res.data) setCategories(res.data); } catch (e) {}
  };

  useEffect(() => { fetchData(); }, [current, pageSize]);
  useEffect(() => { fetchCategories(); }, []);

  const handleSearch = () => { setCurrent(1); fetchData(); };
  const handleReset = () => { setFilterName(''); setFilterCategory(''); setFilterStatus(''); setCurrent(1); };

  const handleOpenAdd = () => { setEditingItem(null); setFormData({ name: '', categoryId: 0, address: '', ticketPrice: 0, description: '', coverImage: '', status: 1, longitude: 0, latitude: 0, trafficGuide: '', openingHours: '' }); setModalMode('add'); setIsModalOpen(true); };
  const handleOpenEdit = (item: Attraction) => { setEditingItem(item); setFormData({ name: item.name, categoryId: item.categoryId, address: item.address, ticketPrice: item.ticketPrice, description: item.description, coverImage: item.coverImage, status: item.status, longitude: item.longitude || 0, latitude: item.latitude || 0, trafficGuide: item.trafficGuide || '', openingHours: item.openingHours || '' }); setModalMode('edit'); setIsModalOpen(true); };

  const handleSave = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      if (modalMode === 'edit' && editingItem) { await attractionApi.updateAttraction(editingItem.id, formData as any); }
      else { await attractionApi.createAttraction(formData as any); }
      setIsModalOpen(false); fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!await confirm({ message: '确定要删除此景点吗？', type: 'danger' })) return;
    try { await attractionApi.deleteAttraction(id); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '删除失败'); }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm({ message: `确定要删除选中的 ${selectedIds.length} 个景点吗？`, type: 'danger' })) return;
    try { await attractionApi.batchDeleteAttractions(selectedIds); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '批量删除失败'); }
  };
  const handleBatchStatus = async (status: number) => {
    if (selectedIds.length === 0) return;
    try { await attractionApi.batchUpdateAttractionStatus(selectedIds, status); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? attractions.map(a => a.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const res = await fileApi.uploadFile(file); if (res.data?.code === 200 && res.data?.data) setFormData(f => ({ ...f, coverImage: res.data.data.url })); }
    catch (e) { toast.error('上传失败'); }
  };

  const totalPages = Math.ceil(total / pageSize);
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  return (
    <div className="space-y-6">
      {confirmDialog}
      <MobileFilterPanel title="景点筛选与操作">
        <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 md:flex md:flex-wrap md:items-center md:gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">景点名称</label>
            <input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="请输入景点名称" className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 md:w-48 md:py-1.5" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">分类</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 bg-white md:w-32 md:py-1.5">
              <option value="">全部分类</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">状态</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 bg-white md:w-32 md:py-1.5">
              <option value="">全部</option><option value="启用">启用</option><option value="禁用">禁用</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:gap-2 md:ml-2">
            <button onClick={handleSearch} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white md:rounded md:py-1.5">查询</button>
            <button onClick={handleReset} className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 md:rounded md:py-1.5">重置</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
          <button onClick={handleOpenAdd} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white md:rounded md:py-1.5">添加景点</button>
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
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-bold">
                <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={attractions.length > 0 && selectedIds.length === attractions.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
                <th className="py-3 px-4 text-center border border-gray-300">景点名称</th>
                <th className="py-3 px-4 text-center border border-gray-300">分类</th>
                <th className="py-3 px-4 text-center border border-gray-300">地址</th>
                <th className="py-3 px-4 text-center border border-gray-300">票价</th>
                <th className="py-3 px-4 text-center border border-gray-300">浏览量</th>
                <th className="py-3 px-4 text-center border border-gray-300">状态</th>
                <th className="py-3 px-4 text-center border border-gray-300">创建时间</th>
                <th className="py-3 px-4 text-center border border-gray-300">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {attractions.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.name}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{catMap[item.categoryId] || item.categoryName || '-'}</td>
                  <td className="py-3 px-4 text-center border border-gray-300 truncate max-w-[200px]">{item.address}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">¥{item.ticketPrice}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.viewCount}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className={`px-2 py-0.5 rounded text-xs border ${item.status === 1 ? 'text-sprout-500 bg-sprout-50 border-sprout-200' : 'text-terracotta-500 bg-terracotta-50 border-terracotta-200'}`}>{item.status === 1 ? '启用' : '禁用'}</span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.createdAt}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenEdit(item)} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-3 py-1 rounded text-xs">编辑</button>
                      <button onClick={() => handleDelete(item.id)} className="bg-terracotta-500 hover:bg-terracotta-400 text-white px-3 py-1 rounded text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {attractions.length === 0 && !loading && <tr><td colSpan={9} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <span className="mr-4">共 {total} 条</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white">
            <option value={10}>10条/页</option><option value={20}>20条/页</option><option value={50}>50条/页</option>
          </select>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="text-gray-400 hover:text-bamboo-500 disabled:opacity-50">&lt;</button>
            <span>{current} / {totalPages || 1}</span>
            <button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="text-gray-400 hover:text-bamboo-500 disabled:opacity-50">&gt;</button>
          </div>
        </div>
      </Card>

      <div className="space-y-3 md:hidden">
        {loading && <Card className="p-4 text-center text-sm text-gray-400">加载中...</Card>}
        {!loading && attractions.length === 0 && <Card className="p-8 text-center text-sm text-gray-500">暂无数据</Card>}
        {attractions.map((item) => (
          <MobileDataCard
            key={item.id}
            title={item.name}
            subtitle={item.createdAt || '暂无创建时间'}
            selected={selectedIds.includes(item.id)}
            onSelect={() => handleSelectOne(item.id)}
            tags={[
              <span key="category" className="rounded-full border border-bamboo-200 bg-bamboo-50 px-2 py-0.5 text-[11px] text-bamboo-500">{catMap[item.categoryId] || item.categoryName || '-'}</span>,
              <span key="status" className={`rounded-full border px-2 py-0.5 text-[11px] ${item.status === 1 ? 'border-sprout-200 bg-sprout-50 text-sprout-500' : 'border-terracotta-200 bg-terracotta-50 text-terracotta-500'}`}>{item.status === 1 ? '启用' : '禁用'}</span>,
            ]}
            fields={[
              { label: '票价', value: `¥${item.ticketPrice}` },
              { label: '浏览量', value: item.viewCount },
              { label: '地址', value: item.address || '-', fullWidth: true },
            ]}
            details={[
              { label: '封面', value: item.coverImage ? <img src={item.coverImage} alt="" className="h-20 w-full rounded-2xl object-cover" /> : '无封面', fullWidth: true },
              { label: '描述', value: item.description || '-', fullWidth: true },
            ]}
            actions={[
              { label: '编辑', onClick: () => handleOpenEdit(item), tone: 'primary' },
              { label: '删除', onClick: () => handleDelete(item.id), tone: 'danger' },
            ]}
          />
        ))}
      </div>

      <Card className="p-4 md:hidden">
        <div className="flex flex-col gap-3 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>共 {total} 条</span>
            <span>{current} / {totalPages || 1}</span>
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
        <button onClick={() => handleBatchStatus(1)} className="rounded-full bg-sprout-500 px-3 py-2 text-xs font-medium text-white">启用</button>
        <button onClick={() => handleBatchStatus(0)} className="rounded-full bg-harvest-500 px-3 py-2 text-xs font-medium text-white">禁用</button>
      </MobileBatchActionBar>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'edit' ? '编辑景点' : '新增景点'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">景点名称</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">分类</label><select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 bg-white"><option value={0}>请选择</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">地址</label><input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">票价</label><input type="number" value={formData.ticketPrice} onChange={(e) => setFormData({...formData, ticketPrice: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">经度 (longitude)</label>
              <input type="number" step="0.000001" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: Number(e.target.value)})} placeholder="例如 116.397428" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">纬度 (latitude)</label>
              <input type="number" step="0.000001" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: Number(e.target.value)})} placeholder="例如 39.90923" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
            </div>
          </div>
          <div className="rounded border border-bamboo-100 bg-bamboo-50/40 p-3 text-xs text-bamboo-600">
            提示：可前往 <a href="https://lbs.amap.com/tools/picker" target="_blank" rel="noreferrer" className="underline">高德地图坐标拾取器</a> 输入景点地址获取经纬度后回填，前台地图组件需要这两个字段才能定位。
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">交通指引</label><textarea value={formData.trafficGuide} onChange={(e) => setFormData({...formData, trafficGuide: e.target.value})} rows={2} placeholder="自驾/公交/地铁路线说明" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 resize-y"></textarea></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">开放时间</label><input type="text" value={formData.openingHours} onChange={(e) => setFormData({...formData, openingHours: e.target.value})} placeholder="例如 08:00-18:00（周一闭馆）" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">封面图片</label><div className="flex flex-col gap-3 sm:flex-row sm:items-center">{formData.coverImage && <img src={formData.coverImage} alt="" className="h-16 w-16 rounded object-cover" />}<label className="w-full cursor-pointer rounded-2xl border border-gray-300 bg-white px-4 py-2 text-center text-sm text-gray-600 hover:text-bamboo-500 sm:w-auto sm:rounded">上传<input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" /></label></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 resize-y"></textarea></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">状态</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 bg-white"><option value={1}>启用</option><option value={0}>禁用</option></select></div>
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <button onClick={() => setIsModalOpen(false)} className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 sm:w-auto sm:rounded">取消</button>
            <button onClick={handleSave} disabled={saving} className="w-full rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white hover:bg-bamboo-400 disabled:opacity-50 sm:w-auto sm:rounded">{saving ? '保存中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

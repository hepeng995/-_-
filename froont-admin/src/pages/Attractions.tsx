import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
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
  const [formData, setFormData] = useState({ name: '', categoryId: 0, address: '', ticketPrice: 0, description: '', coverImage: '', status: 1 });

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

  const handleOpenAdd = () => { setEditingItem(null); setFormData({ name: '', categoryId: 0, address: '', ticketPrice: 0, description: '', coverImage: '', status: 1 }); setModalMode('add'); setIsModalOpen(true); };
  const handleOpenEdit = (item: Attraction) => { setEditingItem(item); setFormData({ name: item.name, categoryId: item.categoryId, address: item.address, ticketPrice: item.ticketPrice, description: item.description, coverImage: item.coverImage, status: item.status }); setModalMode('edit'); setIsModalOpen(true); };

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
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">景点名称</label>
            <input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="请输入景点名称" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-[#409eff]" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">分类</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 focus:outline-none focus:border-[#409eff] bg-white">
              <option value="">全部分类</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">状态</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 focus:outline-none focus:border-[#409eff] bg-white">
              <option value="">全部</option><option value="启用">启用</option><option value="禁用">禁用</option>
            </select>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button onClick={handleSearch} className="bg-[#409eff] hover:bg-[#66b1ff] text-white px-4 py-1.5 rounded text-sm">查询</button>
            <button onClick={handleReset} className="bg-white border border-gray-300 hover:text-[#409eff] text-gray-600 px-4 py-1.5 rounded text-sm">重置</button>
          </div>
        </div>
        <button onClick={handleOpenAdd} className="bg-[#409eff] hover:bg-[#66b1ff] text-white px-4 py-1.5 rounded text-sm">添加景点</button>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-[#f8f8f9] text-[#909399] text-sm font-bold">
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
            <tbody className="text-sm text-[#606266]">
              {attractions.map(item => (
                <tr key={item.id} className="hover:bg-[#f5f7fa]">
                  <td className="py-3 px-4 text-center border border-gray-300">{item.name}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{catMap[item.categoryId] || item.categoryName || '-'}</td>
                  <td className="py-3 px-4 text-center border border-gray-300 truncate max-w-[200px]">{item.address}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">¥{item.ticketPrice}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.viewCount}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className={`px-2 py-0.5 rounded text-xs border ${item.status === 1 ? 'text-[#67c23a] bg-[#f0f9eb] border-[#e1f3d8]' : 'text-[#f56c6c] bg-[#fef0f0] border-[#fde2e2]'}`}>{item.status === 1 ? '启用' : '禁用'}</span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.createdAt}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenEdit(item)} className="bg-[#409eff] hover:bg-[#66b1ff] text-white px-3 py-1 rounded text-xs">编辑</button>
                      <button onClick={() => handleDelete(item.id)} className="bg-[#f56c6c] hover:bg-[#f78989] text-white px-3 py-1 rounded text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {attractions.length === 0 && !loading && <tr><td colSpan={8} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-[#606266]">
          <span className="mr-4">共 {total} 条</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white">
            <option value={10}>10条/页</option><option value={20}>20条/页</option><option value={50}>50条/页</option>
          </select>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="text-gray-400 hover:text-[#409eff] disabled:opacity-50">&lt;</button>
            <span>{current} / {totalPages || 1}</span>
            <button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="text-gray-400 hover:text-[#409eff] disabled:opacity-50">&gt;</button>
          </div>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'edit' ? '编辑景点' : '新增景点'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">景点名称</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">分类</label><select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff] bg-white"><option value={0}>请选择</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">地址</label><input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">票价</label><input type="number" value={formData.ticketPrice} onChange={(e) => setFormData({...formData, ticketPrice: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">封面图片</label><div className="flex items-center gap-2">{formData.coverImage && <img src={formData.coverImage} alt="" className="w-16 h-16 object-cover rounded" />}<label className="px-4 py-2 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:text-[#409eff] cursor-pointer">上传<input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" /></label></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">描述</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff] resize-y"></textarea></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">状态</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff] bg-white"><option value={1}>启用</option><option value={0}>禁用</option></select></div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-[#409eff] rounded hover:bg-[#66b1ff] disabled:opacity-50">{saving ? '保存中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

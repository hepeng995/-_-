import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import * as newsApi from '../api/news';
import * as fileApi from '../api/file';
import type { NewsItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

const CATEGORY_MAP: Record<string, string> = { news: '新闻动态', policy: '政策法规', activity: '活动通知' };
const STATUS_MAP: Record<number, string> = { 0: '草稿', 1: '已发布', 2: '已下线' };

export default function News() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'news', author: '', source: '', content: '', coverImage: '', isTop: false, isFeatured: false, status: 0 });

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncForm, setSyncForm] = useState({ category: 'news', keyword: '', num: 20, force: false });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await newsApi.getNewsPage({ current, size: pageSize, title: filterTitle || undefined, category: filterCategory || undefined, status: filterStatus ? Number(filterStatus) : undefined });
      if (res.code === 200 && res.data) { setNewsList(res.data.records || []); setTotal(res.data.total || 0); }
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [current, pageSize]);

  const handleSearch = () => { setCurrent(1); fetchData(); };
  const handleReset = () => { setFilterTitle(''); setFilterCategory(''); setFilterStatus(''); setCurrent(1); };

  const handleOpenAdd = () => { setEditingItem(null); setFormData({ title: '', category: 'news', author: '', source: '', content: '', coverImage: '', isTop: false, isFeatured: false, status: 0 }); setModalMode('add'); setIsModalOpen(true); };
  const handleOpenEdit = (item: NewsItem) => { setEditingItem(item); setFormData({ title: item.title, category: item.category, author: item.author, source: item.source || '', content: item.content, coverImage: item.coverImage, isTop: item.isTop, isFeatured: item.isFeatured, status: item.status }); setModalMode('edit'); setIsModalOpen(true); };

  const handleSave = async () => {
    if (!formData.title) return; setSaving(true);
    try {
      if (modalMode === 'edit' && editingItem) await newsApi.updateNews(editingItem.id, formData);
      else await newsApi.createNews(formData);
      setIsModalOpen(false); fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => { if (!await confirm({ message: '确定要删除吗？', type: 'danger' })) return; try { await newsApi.deleteNews(id); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '删除失败'); } };
  const handlePublish = async (id: number) => { try { await newsApi.publishNews(id); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '发布失败'); } };
  const handleUnpublish = async (id: number) => { try { await newsApi.unpublishNews(id); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '下线失败'); } };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm({ message: `确定要删除选中的 ${selectedIds.length} 条资讯吗？`, type: 'danger' })) return;
    try { await newsApi.batchDeleteNews(selectedIds); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '批量删除失败'); }
  };
  const handleBatchStatus = async (status: number) => {
    if (selectedIds.length === 0) return;
    try { await newsApi.batchUpdateNewsStatus(selectedIds, status); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? newsList.map(n => n.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const res = await fileApi.uploadFile(file); if (res.data?.code === 200 && res.data?.data) setFormData(f => ({ ...f, coverImage: res.data.data.url })); } catch (e) { toast.error('上传失败'); }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await newsApi.syncTianApiNews({ category: syncForm.category, keyword: syncForm.keyword || undefined, num: syncForm.num, force: syncForm.force });
      if (res.code === 200) {
        const d = res.data;
        toast.success(`同步完成：获取 ${d.fetched} 条，新增 ${d.saved} 条，更新 ${d.updated || 0} 条，跳过 ${d.skipped} 条`);
        setIsSyncModalOpen(false);
        fetchData();
      } else { toast.error(res.message || '同步失败'); }
    } catch (e: any) { toast.error(e?.response?.data?.message || '同步失败'); } finally { setSyncing(false); }
  };

  const handleBackfill = async () => {
    if (!await confirm({ message: '确定要回填已有文章的正文内容吗？该操作会从原文链接抓取完整正文，可能耗时较长。', type: 'info' })) return;
    try {
      const res = await newsApi.backfillNewsContent();
      if (res.code === 200) {
        const d = res.data;
        toast.success(`回填完成：总数 ${d.total}，成功 ${d.success}，失败 ${d.failed}，跳过 ${d.skipped}`);
        fetchData();
      } else { toast.error(res.message || '回填失败'); }
    } catch (e: any) { toast.error(e?.response?.data?.message || '回填失败'); }
  };

  const handleBackfillCovers = async () => {
    if (!await confirm({ message: '确定要回填缺少的封面图吗？将从TianAPI重新匹配并下载。', type: 'info' })) return;
    try {
      const res = await newsApi.backfillCoverImages();
      if (res.code === 200) {
        const d = res.data;
        toast.success(`封面图回填完成：总数 ${d.total}，成功 ${d.success}，失败 ${d.failed}，跳过 ${d.skipped}`);
        fetchData();
      } else { toast.error(res.message || '回填失败'); }
    } catch (e: any) { toast.error(e?.response?.data?.message || '回填失败'); }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {confirmDialog}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">标题</label><input type="text" value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} placeholder="搜索标题" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">分类</label><select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white"><option value="">全部</option>{Object.entries(CATEGORY_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">状态</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white"><option value="">全部</option>{Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <button onClick={handleSearch} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm">查询</button>
          <button onClick={handleReset} className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm">重置</button>
          <button onClick={() => setIsSyncModalOpen(true)} className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-1.5 rounded text-sm">同步TianAPI</button>
          <button onClick={handleBackfill} className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-1.5 rounded text-sm">回填正文</button>
          <button onClick={handleBackfillCovers} className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-1.5 rounded text-sm">回填封面图</button>
        </div>
        <button onClick={handleOpenAdd} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm">发布资讯</button>
        <button onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="bg-terracotta-500 hover:bg-terracotta-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">批量删除</button>
        <button onClick={() => handleBatchStatus(1)} disabled={selectedIds.length === 0} className="bg-sprout-500 hover:bg-sprout-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">批量发布</button>
        <button onClick={() => handleBatchStatus(2)} disabled={selectedIds.length === 0} className="bg-harvest-500 hover:bg-harvest-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">批量下线</button>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead><tr className="bg-gray-50 text-gray-500 text-sm font-bold">
              <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={newsList.length > 0 && selectedIds.length === newsList.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
              <th className="py-3 px-4 text-center border border-gray-300">标题</th>
              <th className="py-3 px-4 text-center border border-gray-300">分类</th>
              <th className="py-3 px-4 text-center border border-gray-300">作者</th>
              <th className="py-3 px-4 text-center border border-gray-300">浏览量</th>
              <th className="py-3 px-4 text-center border border-gray-300">置顶</th>
              <th className="py-3 px-4 text-center border border-gray-300">状态</th>
              <th className="py-3 px-4 text-center border border-gray-300">创建时间</th>
              <th className="py-3 px-4 text-center border border-gray-300">操作</th>
            </tr></thead>
            <tbody className="text-sm text-gray-600">
              {newsList.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                  <td className="py-3 px-4 text-center border border-gray-300 max-w-[250px] truncate">{item.title}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{CATEGORY_MAP[item.category] || item.category}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.author}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.viewCount}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.isTop ? '是' : '否'}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className={`px-2 py-0.5 rounded text-xs border ${item.status === 1 ? 'text-sprout-500 bg-sprout-50 border-sprout-200' : item.status === 0 ? 'text-harvest-500 bg-harvest-50 border-harvest-200' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>{STATUS_MAP[item.status] || '-'}</span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.createdAt}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      <button onClick={() => handleOpenEdit(item)} className="bg-bamboo-500 text-white px-2 py-1 rounded text-xs">编辑</button>
                      {item.status === 0 && <button onClick={() => handlePublish(item.id)} className="bg-sprout-500 text-white px-2 py-1 rounded text-xs">发布</button>}
                      {item.status === 1 && <button onClick={() => handleUnpublish(item.id)} className="bg-harvest-500 text-white px-2 py-1 rounded text-xs">下线</button>}
                      <button onClick={() => handleDelete(item.id)} className="bg-terracotta-500 text-white px-2 py-1 rounded text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {newsList.length === 0 && !loading && <tr><td colSpan={9} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <span className="mr-4">共 {total} 条</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white"><option value={10}>10条/页</option><option value={20}>20条/页</option></select>
          <div className="flex items-center gap-2"><button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="text-gray-400 disabled:opacity-50">&lt;</button><span>{current}/{totalPages || 1}</span><button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="text-gray-400 disabled:opacity-50">&gt;</button></div>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'edit' ? '编辑资讯' : '发布资讯'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">标题</label><input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">分类</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">{Object.entries(CATEGORY_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">作者</label><input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">来源</label><input type="text" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">封面</label><div className="flex items-center gap-2">{formData.coverImage && <img src={formData.coverImage} alt="" className="w-16 h-16 object-cover rounded" />}<label className="px-4 py-2 bg-white border border-gray-300 rounded text-sm text-gray-600 cursor-pointer">上传<input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" /></label></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">内容</label><textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 resize-y"></textarea></div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.isTop} onChange={(e) => setFormData({...formData, isTop: e.target.checked})} />置顶</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} />推荐</label>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-bamboo-500 rounded disabled:opacity-50">{saving ? '保存中...' : '确定'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} title="同步TianAPI农业新闻">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select value={syncForm.category} onChange={(e) => setSyncForm({ ...syncForm, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
              <option value="news">新闻动态</option>
              <option value="policy">政策法规</option>
              <option value="activity">活动通知</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关键词（可选）</label>
            <input type="text" value={syncForm.keyword} onChange={(e) => setSyncForm({ ...syncForm, keyword: e.target.value })} placeholder="输入搜索关键词" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">获取数量 (1-50)</label>
            <input type="number" value={syncForm.num} onChange={(e) => setSyncForm({ ...syncForm, num: Math.min(50, Math.max(1, Number(e.target.value))) })} min={1} max={50} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={syncForm.force} onChange={(e) => setSyncForm({ ...syncForm, force: e.target.checked })} />
            强制刷新（忽略缓存，更新已有文章）
          </label>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsSyncModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded">取消</button>
            <button onClick={handleSync} disabled={syncing} className="px-4 py-2 text-sm text-white bg-blue-500 rounded disabled:opacity-50">{syncing ? '同步中...' : '开始同步'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { AlertCircle } from 'lucide-react';
import * as forumApi from '../api/forum';
import type { ForumPost } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

export default function ForumPosts() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditPost, setAuditPost] = useState<ForumPost | null>(null);
  const [auditStatus, setAuditStatus] = useState(1);
  const [auditReason, setAuditReason] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await forumApi.getPostsPage({
        current, size: pageSize,
        title: filterTitle || undefined,
        category: filterCategory || undefined,
        status: filterStatus !== '' ? Number(filterStatus) : undefined,
      });
      if (res.code === 200 && res.data) { setPosts(res.data.records || []); setTotal(res.data.total || 0); }
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [current, pageSize]);

  const handleSearch = () => { setCurrent(1); fetchData(); };
  const handleReset = () => { setFilterTitle(''); setFilterCategory(''); setFilterStatus(''); setCurrent(1); };

  const handleDelete = async (id: number) => { if (!await confirm({ message: '确定要删除此帖子吗？', type: 'danger' })) return; try { await forumApi.deletePost(id); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '删除失败'); } };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm({ message: `确定要删除选中的 ${selectedIds.length} 个帖子吗？`, type: 'danger' })) return;
    try { await forumApi.batchDeletePosts(selectedIds); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '批量删除失败'); }
  };
  const handleBatchAudit = async (status: number) => {
    if (selectedIds.length === 0) return;
    try { await forumApi.batchAuditPosts(selectedIds, status); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '批量审核失败'); }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? posts.map(p => p.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  const handleAuditClick = (post: ForumPost) => { setAuditPost(post); setAuditStatus(1); setAuditReason(''); setIsAuditModalOpen(true); };
  const handleAuditSubmit = async () => {
    if (!auditPost) return; setSaving(true);
    try { await forumApi.auditPost(auditPost.id, auditStatus, auditStatus === 2 ? auditReason : undefined); setIsAuditModalOpen(false); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '审核失败'); } finally { setSaving(false); }
  };

  const handleToggleTop = async (post: ForumPost) => { try { await forumApi.setPostTop(post.id, !post.isTop); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); } };
  const handleToggleFeatured = async (post: ForumPost) => { try { await forumApi.setPostFeatured(post.id, !post.isFeatured); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); } };

  const totalPages = Math.ceil(total / pageSize);
  const categories = forumApi.getCategoryOptions();

  return (
    <div className="space-y-6">
      {confirmDialog}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">标题</label><input type="text" value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} placeholder="搜索" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">分类</label><select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white"><option value="">全部</option>{categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">状态</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white"><option value="">全部</option><option value="0">待审核</option><option value="1">已通过</option><option value="2">已拒绝</option></select></div>
          <button onClick={handleSearch} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm">查询</button>
          <button onClick={handleReset} className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm">重置</button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => handleBatchAudit(1)} disabled={selectedIds.length === 0} className="bg-sprout-500 hover:bg-sprout-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">批量通过</button>
          <button onClick={() => handleBatchAudit(2)} disabled={selectedIds.length === 0} className="bg-harvest-500 hover:bg-harvest-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">批量拒绝</button>
          <button onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="bg-terracotta-500 hover:bg-terracotta-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">批量删除</button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead><tr className="bg-gray-50 text-gray-500 text-sm font-bold">
              <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={posts.length > 0 && selectedIds.length === posts.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
              <th className="py-3 px-4 text-center border border-gray-300">标题</th>
              <th className="py-3 px-4 text-center border border-gray-300">分类</th>
              <th className="py-3 px-4 text-center border border-gray-300">作者</th>
              <th className="py-3 px-4 text-center border border-gray-300">浏览/点赞/评论</th>
              <th className="py-3 px-4 text-center border border-gray-300">状态</th>
              <th className="py-3 px-4 text-center border border-gray-300">创建时间</th>
              <th className="py-3 px-4 text-center border border-gray-300">操作</th>
            </tr></thead>
            <tbody className="text-sm text-gray-600">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(post.id)} onChange={() => handleSelectOne(post.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                  <td className="py-3 px-4 text-center border border-gray-300 max-w-[200px] truncate">
                    <span className="flex items-center justify-center gap-1">{post.isTop && <span className="text-xs text-terracotta-500 font-bold">[置顶]</span>}{post.isFeatured && <span className="text-xs text-harvest-500 font-bold">[精华]</span>}{post.title}</span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{forumApi.getCategoryName(post.category)}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{post.username}</td>
                  <td className="py-3 px-4 text-center border border-gray-300 text-xs">{post.viewCount}/{post.likeCount}/{post.commentCount}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className={`px-2 py-0.5 rounded text-xs border ${post.status === 1 ? 'text-sprout-500 bg-sprout-50 border-sprout-200' : post.status === 0 ? 'text-harvest-500 bg-harvest-50 border-harvest-200' : 'text-terracotta-500 bg-terracotta-50 border-terracotta-200'}`}>{forumApi.getStatusName(post.status)}</span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{post.createdAt}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {post.status === 0 && <button onClick={() => handleAuditClick(post)} className="bg-bamboo-500 text-white px-2 py-1 rounded text-xs">审核</button>}
                      <button onClick={() => handleToggleTop(post)} className={`${post.isTop ? 'bg-harvest-500' : 'bg-gray-500'} text-white px-2 py-1 rounded text-xs`}>{post.isTop ? '取消置顶' : '置顶'}</button>
                      <button onClick={() => handleToggleFeatured(post)} className={`${post.isFeatured ? 'bg-harvest-500' : 'bg-gray-500'} text-white px-2 py-1 rounded text-xs`}>{post.isFeatured ? '取消精华' : '精华'}</button>
                      <button onClick={() => handleDelete(post.id)} className="bg-terracotta-500 text-white px-2 py-1 rounded text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && !loading && <tr><td colSpan={8} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <span className="mr-4">共 {total} 条</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white"><option value={10}>10条/页</option><option value={20}>20条/页</option></select>
          <div className="flex items-center gap-2"><button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="text-gray-400 disabled:opacity-50">&lt;</button><span>{current}/{totalPages || 1}</span><button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="text-gray-400 disabled:opacity-50">&gt;</button></div>
        </div>
      </Card>

      {/* 审核弹窗 */}
      <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title="审核帖子">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">帖子标题：<span className="font-medium text-gray-800">{auditPost?.title}</span></p>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">审核结果</label>
            <select value={auditStatus} onChange={(e) => setAuditStatus(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded bg-white">
              <option value={1}>通过</option><option value={2}>拒绝</option>
            </select>
          </div>
          {auditStatus === 2 && <div><label className="block text-sm font-medium text-gray-700 mb-1">拒绝原因</label><input type="text" value={auditReason} onChange={(e) => setAuditReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" placeholder="请输入拒绝原因" /></div>}
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsAuditModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded">取消</button>
            <button onClick={handleAuditSubmit} disabled={saving} className="px-4 py-2 text-sm text-white bg-bamboo-500 rounded disabled:opacity-50">{saving ? '提交中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

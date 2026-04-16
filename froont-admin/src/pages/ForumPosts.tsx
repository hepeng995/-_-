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
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">标题</label><input type="text" value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} placeholder="搜索" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-[#409eff]" /></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">分类</label><select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white"><option value="">全部</option>{categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">状态</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white"><option value="">全部</option><option value="0">待审核</option><option value="1">已通过</option><option value="2">已拒绝</option></select></div>
          <button onClick={handleSearch} className="bg-[#409eff] hover:bg-[#66b1ff] text-white px-4 py-1.5 rounded text-sm">查询</button>
          <button onClick={handleReset} className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm">重置</button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead><tr className="bg-[#f8f8f9] text-[#909399] text-sm font-bold">
              <th className="py-3 px-4 text-center border border-gray-300">标题</th>
              <th className="py-3 px-4 text-center border border-gray-300">分类</th>
              <th className="py-3 px-4 text-center border border-gray-300">作者</th>
              <th className="py-3 px-4 text-center border border-gray-300">浏览/点赞/评论</th>
              <th className="py-3 px-4 text-center border border-gray-300">状态</th>
              <th className="py-3 px-4 text-center border border-gray-300">创建时间</th>
              <th className="py-3 px-4 text-center border border-gray-300">操作</th>
            </tr></thead>
            <tbody className="text-sm text-[#606266]">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-[#f5f7fa]">
                  <td className="py-3 px-4 text-center border border-gray-300 max-w-[200px] truncate">
                    <span className="flex items-center justify-center gap-1">{post.isTop && <span className="text-xs text-[#f56c6c] font-bold">[置顶]</span>}{post.isFeatured && <span className="text-xs text-[#e6a23c] font-bold">[精华]</span>}{post.title}</span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{forumApi.getCategoryName(post.category)}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{post.username}</td>
                  <td className="py-3 px-4 text-center border border-gray-300 text-xs">{post.viewCount}/{post.likeCount}/{post.commentCount}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className={`px-2 py-0.5 rounded text-xs border ${post.status === 1 ? 'text-[#67c23a] bg-[#f0f9eb] border-[#e1f3d8]' : post.status === 0 ? 'text-[#e6a23c] bg-[#fdf6ec] border-[#faecd8]' : 'text-[#f56c6c] bg-[#fef0f0] border-[#fde2e2]'}`}>{forumApi.getStatusName(post.status)}</span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{post.createdAt}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {post.status === 0 && <button onClick={() => handleAuditClick(post)} className="bg-[#409eff] text-white px-2 py-1 rounded text-xs">审核</button>}
                      <button onClick={() => handleToggleTop(post)} className={`${post.isTop ? 'bg-[#e6a23c]' : 'bg-[#909399]'} text-white px-2 py-1 rounded text-xs`}>{post.isTop ? '取消置顶' : '置顶'}</button>
                      <button onClick={() => handleToggleFeatured(post)} className={`${post.isFeatured ? 'bg-[#e6a23c]' : 'bg-[#909399]'} text-white px-2 py-1 rounded text-xs`}>{post.isFeatured ? '取消精华' : '精华'}</button>
                      <button onClick={() => handleDelete(post.id)} className="bg-[#f56c6c] text-white px-2 py-1 rounded text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && !loading && <tr><td colSpan={7} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-[#606266]">
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
          {auditStatus === 2 && <div><label className="block text-sm font-medium text-gray-700 mb-1">拒绝原因</label><input type="text" value={auditReason} onChange={(e) => setAuditReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#409eff]" placeholder="请输入拒绝原因" /></div>}
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsAuditModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded">取消</button>
            <button onClick={handleAuditSubmit} disabled={saving} className="px-4 py-2 text-sm text-white bg-[#409eff] rounded disabled:opacity-50">{saving ? '提交中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

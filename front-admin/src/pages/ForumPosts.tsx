import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MobileFilterPanel } from '../components/ui/MobileFilterPanel';
import { MobileBatchActionBar } from '../components/ui/MobileBatchActionBar';
import { MobileDataCard } from '../components/ui/MobileDataCard';
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
      <MobileFilterPanel title="帖子筛选与操作">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 md:flex md:flex-wrap md:items-center md:gap-6">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">标题</label><input type="text" value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} placeholder="搜索" className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 md:w-48 md:py-1.5" /></div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">分类</label><select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-32 md:py-1.5"><option value="">全部</option>{categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">状态</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-32 md:py-1.5"><option value="">全部</option><option value="0">待审核</option><option value="1">已通过</option><option value="2">已拒绝</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
            <button onClick={handleSearch} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white md:rounded md:py-1.5">查询</button>
            <button onClick={handleReset} className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 md:rounded md:py-1.5">重置</button>
            <button onClick={() => handleBatchAudit(1)} disabled={selectedIds.length === 0} className="rounded-2xl bg-sprout-500 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量通过</button>
            <button onClick={() => handleBatchAudit(2)} disabled={selectedIds.length === 0} className="rounded-2xl bg-harvest-500 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量拒绝</button>
            <button onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="rounded-2xl bg-terracotta-500 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量删除</button>
          </div>
        </div>
      </MobileFilterPanel>

      <Card className="hidden overflow-hidden p-0 md:block">
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

      <div className="space-y-3 md:hidden">
        {loading && <Card className="p-4 text-center text-sm text-gray-400">加载中...</Card>}
        {!loading && posts.length === 0 && <Card className="p-8 text-center text-sm text-gray-500">暂无数据</Card>}
        {posts.map((post) => (
          <MobileDataCard
            key={post.id}
            title={post.title}
            subtitle={post.createdAt || '暂无创建时间'}
            selected={selectedIds.includes(post.id)}
            onSelect={() => handleSelectOne(post.id)}
            tags={[
              <span key="category" className="rounded-full border border-bamboo-200 bg-bamboo-50 px-2 py-0.5 text-[11px] text-bamboo-500">{forumApi.getCategoryName(post.category)}</span>,
              <span key="status" className={`rounded-full border px-2 py-0.5 text-[11px] ${post.status === 1 ? 'border-sprout-200 bg-sprout-50 text-sprout-500' : post.status === 0 ? 'border-harvest-200 bg-harvest-50 text-harvest-500' : 'border-terracotta-200 bg-terracotta-50 text-terracotta-500'}`}>{forumApi.getStatusName(post.status)}</span>,
            ]}
            fields={[
              { label: '作者', value: post.username || '-' },
              { label: '数据', value: `${post.viewCount}/${post.likeCount}/${post.commentCount}` },
            ]}
            details={[
              { label: '置顶', value: post.isTop ? '是' : '否' },
              { label: '精华', value: post.isFeatured ? '是' : '否' },
            ]}
            actions={[
              ...(post.status === 0 ? [{ label: '审核', onClick: () => handleAuditClick(post), tone: 'primary' as const }] : []),
              { label: post.isTop ? '取消置顶' : '置顶', onClick: () => handleToggleTop(post), tone: 'warning' as const },
              { label: post.isFeatured ? '取消精华' : '精华', onClick: () => handleToggleFeatured(post), tone: 'success' as const },
              { label: '删除', onClick: () => handleDelete(post.id), tone: 'danger' as const },
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
        <button onClick={() => handleBatchAudit(1)} className="rounded-full bg-sprout-500 px-3 py-2 text-xs font-medium text-white">通过</button>
        <button onClick={() => handleBatchAudit(2)} className="rounded-full bg-harvest-500 px-3 py-2 text-xs font-medium text-white">拒绝</button>
        <button onClick={handleBatchDelete} className="rounded-full bg-terracotta-500 px-3 py-2 text-xs font-medium text-white">删除</button>
      </MobileBatchActionBar>

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
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <button onClick={() => setIsAuditModalOpen(false)} className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 sm:w-auto sm:rounded">取消</button>
            <button onClick={handleAuditSubmit} disabled={saving} className="w-full rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white disabled:opacity-50 sm:w-auto sm:rounded">{saving ? '提交中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MobileFilterPanel } from '../components/ui/MobileFilterPanel';
import { MobileBatchActionBar } from '../components/ui/MobileBatchActionBar';
import { MobileDataCard } from '../components/ui/MobileDataCard';
import * as forumApi from '../api/forum';
import type { ForumComment } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

export default function ForumComments() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterUsername, setFilterUsername] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditComment, setAuditComment] = useState<ForumComment | null>(null);
  const [auditStatus, setAuditStatus] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await forumApi.getCommentsPage({
        current, size: pageSize,
        username: filterUsername || undefined,
        status: filterStatus !== '' ? Number(filterStatus) : undefined,
      });
      if (res.code === 200 && res.data) { setComments(res.data.records || []); setTotal(res.data.total || 0); }
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [current, pageSize]);

  const handleSearch = () => { setCurrent(1); fetchData(); };
  const handleReset = () => { setFilterUsername(''); setFilterStatus(''); setCurrent(1); };

  const handleDelete = async (id: number) => { if (!await confirm({ message: '确定要删除吗？', type: 'danger' })) return; try { await forumApi.deleteComment(id); fetchData(); } catch (e: any) { toast.error(e?.response?.data?.message || '删除失败'); } };
  const handleBatchDelete = async () => { if (selectedIds.length === 0) return; if (!await confirm({ message: `确定删除选中的 ${selectedIds.length} 条评论吗？`, type: 'danger' })) return; try { for (const id of selectedIds) await forumApi.deleteComment(id); setSelectedIds([]); fetchData(); } catch (e: any) { toast.error('部分删除失败'); } };

  const handleAuditClick = (comment: ForumComment) => { setAuditComment(comment); setAuditStatus(1); setIsAuditModalOpen(true); };
  const handleAuditSubmit = async () => {
    if (!auditComment) return; setSaving(true);
    try { await forumApi.auditComment(auditComment.id, auditStatus); setIsAuditModalOpen(false); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '审核失败'); } finally { setSaving(false); }
  };

  const handleBatchAudit = async (status: number) => {
    if (selectedIds.length === 0) return;
    try { for (const id of selectedIds) await forumApi.auditComment(id, status); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error('部分审核失败'); }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? comments.map(c => c.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {confirmDialog}
      <MobileFilterPanel title="评论筛选与操作">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 md:flex md:flex-wrap md:items-center md:gap-6">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">用户名</label><input type="text" value={filterUsername} onChange={(e) => setFilterUsername(e.target.value)} placeholder="搜索" className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 md:w-48 md:py-1.5" /></div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">状态</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-32 md:py-1.5"><option value="">全部</option><option value="0">待审核</option><option value="1">已通过</option><option value="2">已拒绝</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
            <button onClick={handleSearch} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white md:rounded md:py-1.5">查询</button>
            <button onClick={handleReset} className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 md:rounded md:py-1.5">重置</button>
            <button onClick={() => handleBatchAudit(1)} disabled={selectedIds.length === 0} className="rounded-2xl bg-sprout-500 px-4 py-2 text-sm text-white disabled:opacity-50 md:rounded md:py-1.5">批量通过</button>
            <button onClick={() => handleBatchAudit(2)} disabled={selectedIds.length === 0} className="rounded-2xl bg-harvest-500 px-4 py-2 text-sm text-white disabled:opacity-50 md:rounded md:py-1.5">批量拒绝</button>
            <button onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="rounded-2xl bg-terracotta-500 px-4 py-2 text-sm text-white disabled:opacity-50 md:rounded md:py-1.5">批量删除</button>
          </div>
        </div>
      </MobileFilterPanel>

      <Card className="hidden overflow-hidden p-0 md:block">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead><tr className="bg-gray-50 text-gray-500 text-sm font-bold">
              <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={comments.length > 0 && selectedIds.length === comments.length} onChange={handleSelectAll} className="rounded border-gray-300" /></th>
              <th className="py-3 px-4 text-center border border-gray-300">内容</th>
              <th className="py-3 px-4 text-center border border-gray-300">用户</th>
              <th className="py-3 px-4 text-center border border-gray-300">点赞</th>
              <th className="py-3 px-4 text-center border border-gray-300">状态</th>
              <th className="py-3 px-4 text-center border border-gray-300">时间</th>
              <th className="py-3 px-4 text-center border border-gray-300">操作</th>
            </tr></thead>
            <tbody className="text-sm text-gray-600">
              {comments.map(comment => (
                <tr key={comment.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(comment.id)} onChange={() => handleSelectOne(comment.id)} className="rounded border-gray-300" /></td>
                  <td className="py-3 px-4 border border-gray-300 max-w-[300px] truncate">{comment.content}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{comment.username}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{comment.likeCount}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className={`px-2 py-0.5 rounded text-xs border ${comment.status === 1 ? 'text-sprout-500 bg-sprout-50 border-sprout-200' : comment.status === 0 ? 'text-harvest-500 bg-harvest-50 border-harvest-200' : 'text-terracotta-500 bg-terracotta-50 border-terracotta-200'}`}>{forumApi.getStatusName(comment.status)}</span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{comment.createdAt}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <div className="flex items-center justify-center gap-1">
                      {comment.status === 0 && <button onClick={() => handleAuditClick(comment)} className="bg-bamboo-500 text-white px-2 py-1 rounded text-xs">审核</button>}
                      <button onClick={() => handleDelete(comment.id)} className="bg-terracotta-500 text-white px-2 py-1 rounded text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && !loading && <tr><td colSpan={7} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
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
        {!loading && comments.length === 0 && <Card className="p-8 text-center text-sm text-gray-500">暂无数据</Card>}
        {comments.map((comment) => (
          <MobileDataCard
            key={comment.id}
            title={comment.username}
            subtitle={comment.createdAt || '暂无时间'}
            selected={selectedIds.includes(comment.id)}
            onSelect={() => handleSelectOne(comment.id)}
            tags={[
              <span key="status" className={`rounded-full border px-2 py-0.5 text-[11px] ${comment.status === 1 ? 'border-sprout-200 bg-sprout-50 text-sprout-500' : comment.status === 0 ? 'border-harvest-200 bg-harvest-50 text-harvest-500' : 'border-terracotta-200 bg-terracotta-50 text-terracotta-500'}`}>{forumApi.getStatusName(comment.status)}</span>,
            ]}
            fields={[
              { label: '评论内容', value: comment.content || '-', fullWidth: true },
              { label: '点赞数', value: comment.likeCount },
            ]}
            actions={[
              ...(comment.status === 0 ? [{ label: '审核', onClick: () => handleAuditClick(comment), tone: 'primary' as const }] : []),
              { label: '删除', onClick: () => handleDelete(comment.id), tone: 'danger' as const },
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

      <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title="审核评论">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">评论内容：<span className="font-medium text-gray-800">{auditComment?.content}</span></p>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">审核结果</label>
            <select value={auditStatus} onChange={(e) => setAuditStatus(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded bg-white"><option value={1}>通过</option><option value={2}>拒绝</option></select>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <button onClick={() => setIsAuditModalOpen(false)} className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 sm:w-auto sm:rounded">取消</button>
            <button onClick={handleAuditSubmit} disabled={saving} className="w-full rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white disabled:opacity-50 sm:w-auto sm:rounded">{saving ? '提交中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

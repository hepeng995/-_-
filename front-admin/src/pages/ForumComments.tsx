import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
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
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">用户名</label><input type="text" value={filterUsername} onChange={(e) => setFilterUsername(e.target.value)} placeholder="搜索" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">状态</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white"><option value="">全部</option><option value="0">待审核</option><option value="1">已通过</option><option value="2">已拒绝</option></select></div>
          <button onClick={handleSearch} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm">查询</button>
          <button onClick={handleReset} className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm">重置</button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => handleBatchAudit(1)} disabled={selectedIds.length === 0} className="bg-sprout-500 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50">批量通过</button>
          <button onClick={() => handleBatchAudit(2)} disabled={selectedIds.length === 0} className="bg-harvest-500 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50">批量拒绝</button>
          <button onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="bg-terracotta-500 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50">批量删除</button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
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

      <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title="审核评论">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">评论内容：<span className="font-medium text-gray-800">{auditComment?.content}</span></p>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">审核结果</label>
            <select value={auditStatus} onChange={(e) => setAuditStatus(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded bg-white"><option value={1}>通过</option><option value={2}>拒绝</option></select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsAuditModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded">取消</button>
            <button onClick={handleAuditSubmit} disabled={saving} className="px-4 py-2 text-sm text-white bg-bamboo-500 rounded disabled:opacity-50">{saving ? '提交中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

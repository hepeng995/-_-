import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MobileFilterPanel } from '../components/ui/MobileFilterPanel';
import { MobileBatchActionBar } from '../components/ui/MobileBatchActionBar';
import { MobileDataCard } from '../components/ui/MobileDataCard';
import * as reviewApi from '../api/review';
import type { Review } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

const STATUS_LABEL: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已拒绝' };
const STATUS_TONE: Record<number, string> = {
  0: 'border-harvest-200 bg-harvest-50 text-harvest-500',
  1: 'border-sprout-200 bg-sprout-50 text-sprout-500',
  2: 'border-terracotta-200 bg-terracotta-50 text-terracotta-500',
};

function renderStars(rating: number) {
  const safe = Math.max(0, Math.min(5, rating || 0));
  return '★'.repeat(safe) + '☆'.repeat(5 - safe);
}

function parseImages(images?: string): string[] {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) return parsed.filter((v) => typeof v === 'string');
  } catch {
    // 兼容逗号分隔
    return images.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export default function Reviews() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filterProductId, setFilterProductId] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHasImages, setFilterHasImages] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailReview, setDetailReview] = useState<Review | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reviewApi.getReviewPage({
        current,
        size: pageSize,
        productId: filterProductId ? Number(filterProductId) : undefined,
        userId: filterUserId ? Number(filterUserId) : undefined,
        rating: filterRating ? Number(filterRating) : undefined,
        status: filterStatus !== '' ? Number(filterStatus) : undefined,
        hasImages: filterHasImages === '' ? undefined : filterHasImages === '1',
      } as any);
      if (res.code === 200 && res.data) {
        setReviews(res.data.records || []);
        setTotal(res.data.total || 0);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, pageSize]);

  const handleSearch = () => { setCurrent(1); fetchData(); };
  const handleReset = () => {
    setFilterProductId(''); setFilterUserId(''); setFilterRating('');
    setFilterStatus(''); setFilterHasImages(''); setCurrent(1);
  };

  const handleAudit = async (id: number, status: number) => {
    try {
      await reviewApi.auditReview(id, status);
      toast.success(status === 1 ? '已通过' : '已拒绝');
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '审核失败');
    }
  };

  const handleBatchAudit = async (status: number) => {
    if (selectedIds.length === 0) return;
    try {
      await reviewApi.batchAuditReviews(selectedIds, status);
      toast.success(`已批量${status === 1 ? '通过' : '拒绝'} ${selectedIds.length} 条`);
      setSelectedIds([]);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '批量审核失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!await confirm({ message: '确定要删除此评价吗？删除后不可恢复。', type: 'danger' })) return;
    try {
      await reviewApi.deleteReview(id);
      toast.success('已删除');
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '删除失败');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? reviews.map((r) => r.id) : []);
  };
  const handleSelectOne = (id: number) => {
    setSelectedIds(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {confirmDialog}
      <MobileFilterPanel title="评价筛选与操作">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 md:flex md:flex-wrap md:items-center md:gap-6">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <label className="text-sm text-gray-600">商品ID</label>
              <input type="number" value={filterProductId} onChange={(e) => setFilterProductId(e.target.value)} placeholder="商品ID" className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 md:w-32 md:py-1.5" />
            </div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <label className="text-sm text-gray-600">用户ID</label>
              <input type="number" value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)} placeholder="用户ID" className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 md:w-32 md:py-1.5" />
            </div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <label className="text-sm text-gray-600">评分</label>
              <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-28 md:py-1.5">
                <option value="">全部</option>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} 星</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <label className="text-sm text-gray-600">状态</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-32 md:py-1.5">
                <option value="">全部</option>
                <option value="0">待审核</option>
                <option value="1">已通过</option>
                <option value="2">已拒绝</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <label className="text-sm text-gray-600">含图</label>
              <select value={filterHasImages} onChange={(e) => setFilterHasImages(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-28 md:py-1.5">
                <option value="">全部</option>
                <option value="1">仅含图</option>
                <option value="0">仅纯文字</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
            <button onClick={handleSearch} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white md:rounded md:py-1.5">查询</button>
            <button onClick={handleReset} className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 md:rounded md:py-1.5">重置</button>
            <button onClick={() => handleBatchAudit(1)} disabled={selectedIds.length === 0} className="rounded-2xl bg-sprout-500 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量通过</button>
            <button onClick={() => handleBatchAudit(2)} disabled={selectedIds.length === 0} className="rounded-2xl bg-harvest-500 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed md:rounded md:py-1.5">批量拒绝</button>
          </div>
        </div>
      </MobileFilterPanel>

      <Card className="hidden overflow-hidden p-0 md:block">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-bold">
                <th className="py-3 px-4 text-center border border-gray-300 w-12">
                  <input type="checkbox" checked={reviews.length > 0 && selectedIds.length === reviews.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" />
                </th>
                <th className="py-3 px-4 text-center border border-gray-300">商品</th>
                <th className="py-3 px-4 text-center border border-gray-300">用户</th>
                <th className="py-3 px-4 text-center border border-gray-300">评分</th>
                <th className="py-3 px-4 text-center border border-gray-300">内容</th>
                <th className="py-3 px-4 text-center border border-gray-300">图片</th>
                <th className="py-3 px-4 text-center border border-gray-300">状态</th>
                <th className="py-3 px-4 text-center border border-gray-300">点赞</th>
                <th className="py-3 px-4 text-center border border-gray-300">时间</th>
                <th className="py-3 px-4 text-center border border-gray-300">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {reviews.map((review) => {
                const imgs = parseImages(review.images);
                return (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-center border border-gray-300">
                      <input type="checkbox" checked={selectedIds.includes(review.id)} onChange={() => handleSelectOne(review.id)} className="rounded border-gray-300 cursor-pointer" />
                    </td>
                    <td className="py-3 px-4 text-center border border-gray-300 max-w-[160px] truncate" title={review.productName}>{review.productName || `#${review.productId}`}</td>
                    <td className="py-3 px-4 text-center border border-gray-300">{review.username}</td>
                    <td className="py-3 px-4 text-center border border-gray-300 text-harvest-500">{renderStars(review.rating)}</td>
                    <td className="py-3 px-4 text-left border border-gray-300 max-w-[260px]">
                      <div className="truncate" title={review.content}>{review.content}</div>
                    </td>
                    <td className="py-3 px-4 text-center border border-gray-300">{imgs.length > 0 ? `${imgs.length} 张` : '-'}</td>
                    <td className="py-3 px-4 text-center border border-gray-300">
                      <span className={`px-2 py-0.5 rounded text-xs border ${STATUS_TONE[review.status] || ''}`}>{STATUS_LABEL[review.status] || review.status}</span>
                    </td>
                    <td className="py-3 px-4 text-center border border-gray-300">{review.helpfulCount}</td>
                    <td className="py-3 px-4 text-center border border-gray-300 text-xs">{review.createdAt}</td>
                    <td className="py-3 px-4 text-center border border-gray-300">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        <button onClick={() => { setDetailReview(review); setDetailOpen(true); }} className="bg-gray-500 text-white px-2 py-1 rounded text-xs">详情</button>
                        {review.status === 0 && (
                          <>
                            <button onClick={() => handleAudit(review.id, 1)} className="bg-sprout-500 text-white px-2 py-1 rounded text-xs">通过</button>
                            <button onClick={() => handleAudit(review.id, 2)} className="bg-harvest-500 text-white px-2 py-1 rounded text-xs">拒绝</button>
                          </>
                        )}
                        <button onClick={() => handleDelete(review.id)} className="bg-terracotta-500 text-white px-2 py-1 rounded text-xs">删除</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {reviews.length === 0 && !loading && (
                <tr><td colSpan={10} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <span className="mr-4">共 {total} 条</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white">
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
          </select>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="text-gray-400 disabled:opacity-50">&lt;</button>
            <span>{current}/{totalPages || 1}</span>
            <button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="text-gray-400 disabled:opacity-50">&gt;</button>
          </div>
        </div>
      </Card>

      <div className="space-y-3 md:hidden">
        {loading && <Card className="p-4 text-center text-sm text-gray-400">加载中...</Card>}
        {!loading && reviews.length === 0 && <Card className="p-8 text-center text-sm text-gray-500">暂无数据</Card>}
        {reviews.map((review) => {
          const imgs = parseImages(review.images);
          return (
            <MobileDataCard
              key={review.id}
              title={review.productName || `商品 #${review.productId}`}
              subtitle={review.createdAt || ''}
              selected={selectedIds.includes(review.id)}
              onSelect={() => handleSelectOne(review.id)}
              tags={[
                <span key="rating" className="rounded-full border border-harvest-200 bg-harvest-50 px-2 py-0.5 text-[11px] text-harvest-500">{renderStars(review.rating)}</span>,
                <span key="status" className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_TONE[review.status] || ''}`}>{STATUS_LABEL[review.status] || review.status}</span>,
              ]}
              fields={[
                { label: '用户', value: review.username || '-' },
                { label: '点赞', value: String(review.helpfulCount || 0) },
              ]}
              details={[
                { label: '内容', value: review.content || '-' },
                { label: '图片', value: imgs.length > 0 ? `${imgs.length} 张` : '无' },
              ]}
              actions={[
                { label: '详情', onClick: () => { setDetailReview(review); setDetailOpen(true); }, tone: 'primary' as const },
                ...(review.status === 0 ? [
                  { label: '通过', onClick: () => handleAudit(review.id, 1), tone: 'success' as const },
                  { label: '拒绝', onClick: () => handleAudit(review.id, 2), tone: 'warning' as const },
                ] : []),
                { label: '删除', onClick: () => handleDelete(review.id), tone: 'danger' as const },
              ]}
            />
          );
        })}
      </div>

      <Card className="p-4 md:hidden">
        <div className="flex flex-col gap-3 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>共 {total} 条</span>
            <span>{current}/{totalPages || 1}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="rounded border border-gray-300 bg-white px-3 py-2">
              <option value={10}>10条/页</option>
              <option value={20}>20条/页</option>
            </select>
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
      </MobileBatchActionBar>

      {/* 详情弹窗 */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="评价详情">
        {detailReview && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">商品：</span>{detailReview.productName || `#${detailReview.productId}`}</div>
              <div><span className="text-gray-500">用户：</span>{detailReview.username}</div>
              <div><span className="text-gray-500">评分：</span><span className="text-harvest-500">{renderStars(detailReview.rating)}</span></div>
              <div><span className="text-gray-500">点赞：</span>{detailReview.helpfulCount}</div>
              <div><span className="text-gray-500">订单号：</span>{detailReview.orderNo || '-'}</div>
              <div><span className="text-gray-500">状态：</span>
                <span className={`px-2 py-0.5 rounded text-xs border ${STATUS_TONE[detailReview.status] || ''}`}>{STATUS_LABEL[detailReview.status]}</span>
              </div>
              <div className="col-span-2"><span className="text-gray-500">时间：</span>{detailReview.createdAt}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">评价内容：</div>
              <div className="rounded bg-gray-50 p-3 text-gray-700 whitespace-pre-wrap break-words">{detailReview.content || '-'}</div>
            </div>
            {(() => {
              const imgs = parseImages(detailReview.images);
              if (imgs.length === 0) return null;
              return (
                <div>
                  <div className="text-gray-500 mb-2">图片（{imgs.length}）：</div>
                  <div className="flex flex-wrap gap-2">
                    {imgs.map((src, i) => (
                      <a key={i} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt={`review-${i}`} className="w-20 h-20 object-cover rounded border border-gray-200" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}
            {detailReview.reply && (
              <div>
                <div className="text-gray-500 mb-1">商家回复（{detailReview.replyTime || ''}）：</div>
                <div className="rounded bg-bamboo-50 p-3 text-bamboo-700 whitespace-pre-wrap break-words">{detailReview.reply}</div>
              </div>
            )}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              {detailReview.status === 0 && (
                <>
                  <button onClick={() => { handleAudit(detailReview.id, 2); setDetailOpen(false); }} className="rounded-2xl bg-harvest-500 px-4 py-2 text-sm text-white sm:rounded">拒绝</button>
                  <button onClick={() => { handleAudit(detailReview.id, 1); setDetailOpen(false); }} className="rounded-2xl bg-sprout-500 px-4 py-2 text-sm text-white sm:rounded">通过</button>
                </>
              )}
              <button onClick={() => setDetailOpen(false)} className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 sm:rounded">关闭</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

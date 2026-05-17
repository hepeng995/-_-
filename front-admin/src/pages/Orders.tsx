import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MobileFilterPanel } from '../components/ui/MobileFilterPanel';
import { MobileBatchActionBar } from '../components/ui/MobileBatchActionBar';
import { MobileDataCard } from '../components/ui/MobileDataCard';
import * as orderApi from '../api/order';
import type { Order, OrderItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';
import { usePrompt } from '../hooks/usePrompt';

const ORDER_STATUS_MAP: Record<number, string> = { 1: '待付款', 2: '待发货', 3: '已发货', 4: '已完成', 5: '已取消', 6: '已退款' };
const PAYMENT_STATUS_MAP: Record<number, string> = { 0: '待支付', 1: '已支付', 2: '支付失败' };
const PAYMENT_METHOD_MAP: Record<string, string> = { alipay: '支付宝', wechat: '微信支付', cash: '现金' };

export default function Orders() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const { prompt, dialog: promptDialog } = usePrompt();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterOrderNo, setFilterOrderNo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrderPage({
        current, size: pageSize,
        orderNo: filterOrderNo || undefined,
        orderStatus: filterStatus ? Number(filterStatus) : undefined,
      });
      if (res.code === 200 && res.data) { setOrders(res.data.records || []); setTotal(res.data.total || 0); }
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [current, pageSize]);

  const handleSearch = () => { setCurrent(1); fetchData(); };
  const handleReset = () => { setFilterOrderNo(''); setFilterStatus(''); setCurrent(1); };

  const handleViewDetail = async (order: Order) => {
    try {
      const res = await orderApi.getOrderById(order.id);
      if (res.code === 200 && res.data) { setDetailOrder(res.data); setIsDetailOpen(true); }
    } catch (e) {}
  };

  const handleUpdateStatus = async (id: number, status: number) => {
    const statusName = ORDER_STATUS_MAP[status];
    if (!await confirm({ message: `确定要将订单状态更改为"${statusName}"吗？`, type: 'warning' })) return;
    try { await orderApi.updateOrderStatus(id, status); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); }
  };

  const handleCancel = async (id: number) => {
    const reason = await prompt({ message: '请输入取消原因:', placeholder: '取消原因', required: true });
    if (!reason) return;
    try { await orderApi.cancelOrder(id, reason); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '取消失败'); }
  };

  const handleShip = async (id: number) => {
    const tracking = await prompt({ message: '请填写发货备注（物流单号等，可留空）：', placeholder: '物流单号 / 备注', required: false });
    if (tracking === null) return;
    try {
      await orderApi.shipOrder(id, tracking || '');
      toast.success('发货成功');
      fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || '发货失败'); }
  };

  const handleRefund = async (id: number) => {
    const reason = await prompt({ message: '请输入退款原因：', placeholder: '例如：用户申请整单退款', required: true });
    if (!reason) return;
    if (!await confirm({ message: '退款将恢复商品库存并销量，订单状态置为已退款，是否确认？', type: 'danger' })) return;
    try {
      await orderApi.refundOrder(id, reason);
      toast.success('退款成功');
      fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || '退款失败'); }
  };

  const handleBatchShip = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm({ message: `确定要将选中的 ${selectedIds.length} 个订单设为已发货吗？`, type: 'warning' })) return;
    try { await orderApi.batchUpdateOrderStatus(selectedIds, 3); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '操作失败'); }
  };
  const handleBatchCancel = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm({ message: `确定要取消选中的 ${selectedIds.length} 个订单吗？`, type: 'danger' })) return;
    try { await orderApi.batchCancelOrders(selectedIds); setSelectedIds([]); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '取消失败'); }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? orders.map(o => o.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  const totalPages = Math.ceil(total / pageSize);

  const getActions = (order: Order) => {
    const actions: { label: string; color: string; action: () => void }[] = [];
    if (order.orderStatus === 1) actions.push({ label: '取消', color: 'bg-terracotta-500', action: () => handleCancel(order.id) });
    if (order.orderStatus === 2) actions.push({ label: '发货', color: 'bg-bamboo-500', action: () => handleShip(order.id) });
    if (order.orderStatus === 3) actions.push({ label: '确认收货', color: 'bg-sprout-500', action: () => handleUpdateStatus(order.id, 4) });
    // 已支付订单（待发货/已发货/已收货）允许管理员退款
    if (order.orderStatus === 2 || order.orderStatus === 3 || order.orderStatus === 4) {
      actions.push({ label: '退款', color: 'bg-terracotta-500', action: () => handleRefund(order.id) });
    }
    return actions;
  };

  return (
    <div className="space-y-6">
      {confirmDialog}
      {promptDialog}
      <MobileFilterPanel title="订单筛选与操作">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 md:flex md:flex-wrap md:items-center md:gap-6">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">订单号</label><input type="text" value={filterOrderNo} onChange={(e) => setFilterOrderNo(e.target.value)} placeholder="搜索订单号" className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 md:w-48 md:py-1.5" /></div>
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"><label className="text-sm text-gray-600">订单状态</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm md:w-32 md:py-1.5">
              <option value="">全部</option>
              {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center">
            <button onClick={handleSearch} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white hover:bg-bamboo-400 md:rounded md:py-1.5">查询</button>
            <button onClick={handleReset} className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 md:rounded md:py-1.5">重置</button>
            <button onClick={handleBatchShip} disabled={selectedIds.length === 0} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 md:rounded md:py-1.5">批量发货</button>
            <button onClick={handleBatchCancel} disabled={selectedIds.length === 0} className="rounded-2xl bg-terracotta-500 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 md:rounded md:py-1.5">批量取消</button>
          </div>
        </div>
      </MobileFilterPanel>

      <Card className="hidden overflow-hidden p-0 md:block">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead><tr className="bg-gray-50 text-gray-500 text-sm font-bold">
              <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={orders.length > 0 && selectedIds.length === orders.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
              <th className="py-3 px-4 text-center border border-gray-300">订单号</th>
              <th className="py-3 px-4 text-center border border-gray-300">金额</th>
              <th className="py-3 px-4 text-center border border-gray-300">收货人</th>
              <th className="py-3 px-4 text-center border border-gray-300">支付方式</th>
              <th className="py-3 px-4 text-center border border-gray-300">支付状态</th>
              <th className="py-3 px-4 text-center border border-gray-300">订单状态</th>
              <th className="py-3 px-4 text-center border border-gray-300">创建时间</th>
              <th className="py-3 px-4 text-center border border-gray-300">操作</th>
            </tr></thead>
            <tbody className="text-sm text-gray-600">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => handleSelectOne(order.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                  <td className="py-3 px-4 text-center border border-gray-300 font-mono text-xs">{order.orderNo}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">¥{order.actualAmount}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{order.deliveryName}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}</td>
                  <td className="py-3 px-4 text-center border border-gray-300"><span className={`px-2 py-0.5 rounded text-xs ${order.paymentStatus === 1 ? 'text-sprout-500 bg-sprout-50' : 'text-harvest-500 bg-harvest-50'}`}>{PAYMENT_STATUS_MAP[order.paymentStatus] || '-'}</span></td>
                  <td className="py-3 px-4 text-center border border-gray-300"><span className="px-2 py-0.5 rounded text-xs border text-bamboo-500 bg-bamboo-50 border-bamboo-200">{ORDER_STATUS_MAP[order.orderStatus] || '-'}</span></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{order.createdAt}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      <button onClick={() => handleViewDetail(order)} className="bg-bamboo-500 text-white px-2 py-1 rounded text-xs">详情</button>
                      {getActions(order).map((a, i) => <button key={i} onClick={a.action} className={`${a.color} text-white px-2 py-1 rounded text-xs`}>{a.label}</button>)}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !loading && <tr><td colSpan={9} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td></tr>}
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
        {!loading && orders.length === 0 && <Card className="p-8 text-center text-sm text-gray-500">暂无数据</Card>}
        {orders.map((order) => (
          <MobileDataCard
            key={order.id}
            title={order.orderNo}
            subtitle={order.createdAt ? `创建时间：${order.createdAt}` : '暂无创建时间'}
            selected={selectedIds.includes(order.id)}
            onSelect={() => handleSelectOne(order.id)}
            tags={[
              <span key="status" className="rounded-full border border-bamboo-200 bg-bamboo-50 px-2 py-0.5 text-[11px] text-bamboo-500">
                {ORDER_STATUS_MAP[order.orderStatus] || '-'}
              </span>,
              <span key="payment" className={`rounded-full px-2 py-0.5 text-[11px] ${order.paymentStatus === 1 ? 'bg-sprout-50 text-sprout-500' : 'bg-harvest-50 text-harvest-500'}`}>
                {PAYMENT_STATUS_MAP[order.paymentStatus] || '-'}
              </span>,
            ]}
            fields={[
              { label: '实付金额', value: `¥${order.actualAmount}` },
              { label: '收货人', value: order.deliveryName || '-' },
              { label: '支付方式', value: PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod || '-' },
            ]}
            details={[
              { label: '联系电话', value: order.deliveryPhone || '-' },
              { label: '收货地址', value: order.deliveryAddress || '-', fullWidth: true },
            ]}
            actions={[
              { label: '详情', onClick: () => handleViewDetail(order), tone: 'primary' },
              ...getActions(order).map((action) => {
                const tone: 'danger' | 'success' | 'warning' = action.color.includes('terracotta')
                  ? 'danger'
                  : action.color.includes('sprout')
                    ? 'success'
                    : 'warning';

                return {
                  label: action.label,
                  onClick: action.action,
                  tone,
                };
              }),
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
        <button onClick={handleBatchShip} className="rounded-full bg-bamboo-500 px-3 py-2 text-xs font-medium text-white">发货</button>
        <button onClick={handleBatchCancel} className="rounded-full bg-terracotta-500 px-3 py-2 text-xs font-medium text-white">取消</button>
      </MobileBatchActionBar>

      {/* 订单详情弹窗 */}
      <Modal isOpen={isDetailOpen && !!detailOrder} onClose={() => setIsDetailOpen(false)} title={detailOrder ? `订单详情 - ${detailOrder.orderNo}` : '订单详情'} className="max-w-3xl">
        {detailOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div><span className="text-gray-500">收货人：</span>{detailOrder.deliveryName}</div>
              <div><span className="text-gray-500">联系电话：</span>{detailOrder.deliveryPhone}</div>
              <div className="sm:col-span-2"><span className="text-gray-500">收货地址：</span>{detailOrder.deliveryAddress}</div>
              <div><span className="text-gray-500">订单金额：</span>¥{detailOrder.totalAmount}</div>
              <div><span className="text-gray-500">实付金额：</span><span className="font-bold text-terracotta-500">¥{detailOrder.actualAmount}</span></div>
              <div><span className="text-gray-500">支付方式：</span>{PAYMENT_METHOD_MAP[detailOrder.paymentMethod] || detailOrder.paymentMethod}</div>
              <div><span className="text-gray-500">订单状态：</span>{ORDER_STATUS_MAP[detailOrder.orderStatus]}</div>
              <div><span className="text-gray-500">创建时间：</span>{detailOrder.createdAt}</div>
              {detailOrder.remark && <div className="sm:col-span-2"><span className="text-gray-500">备注：</span>{detailOrder.remark}</div>}
            </div>
            {detailOrder.orderItems && detailOrder.orderItems.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-gray-700">商品列表</h4>
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full border border-gray-200 text-sm">
                    <thead><tr className="bg-gray-50"><th className="border py-2 px-3 text-center">商品</th><th className="border py-2 px-3 text-center">单价</th><th className="border py-2 px-3 text-center">数量</th><th className="border py-2 px-3 text-center">小计</th></tr></thead>
                    <tbody>
                      {detailOrder.orderItems.map((item, i) => (
                        <tr key={i}><td className="border py-2 px-3 text-center">{item.productName}</td><td className="border py-2 px-3 text-center">¥{item.productPrice}</td><td className="border py-2 px-3 text-center">{item.quantity}</td><td className="border py-2 px-3 text-center">¥{item.totalPrice}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-3 sm:hidden">
                  {detailOrder.orderItems.map((item, i) => (
                    <Card key={i} className="p-4">
                      <p className="text-sm font-semibold text-ink-600">{item.productName}</p>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-500">
                        <div className="rounded-2xl bg-gray-50 px-3 py-2">单价：¥{item.productPrice}</div>
                        <div className="rounded-2xl bg-gray-50 px-3 py-2">数量：{item.quantity}</div>
                        <div className="rounded-2xl bg-gray-50 px-3 py-2">小计：¥{item.totalPrice}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button onClick={() => setIsDetailOpen(false)} className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 sm:w-auto sm:rounded">关闭</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

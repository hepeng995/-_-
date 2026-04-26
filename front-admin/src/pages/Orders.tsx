import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { X } from 'lucide-react';
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
    if (order.orderStatus === 2) actions.push({ label: '发货', color: 'bg-bamboo-500', action: () => handleUpdateStatus(order.id, 3) });
    if (order.orderStatus === 3) actions.push({ label: '确认收货', color: 'bg-sprout-500', action: () => handleUpdateStatus(order.id, 4) });
    return actions;
  };

  return (
    <div className="space-y-6">
      {confirmDialog}
      {promptDialog}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">订单号</label><input type="text" value={filterOrderNo} onChange={(e) => setFilterOrderNo(e.target.value)} placeholder="搜索订单号" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" /></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-600">订单状态</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white">
              <option value="">全部</option>
              {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={handleSearch} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm">查询</button>
          <button onClick={handleReset} className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm">重置</button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleBatchShip} disabled={selectedIds.length === 0} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">批量发货</button>
          <button onClick={handleBatchCancel} disabled={selectedIds.length === 0} className="bg-terracotta-500 hover:bg-terracotta-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">批量取消</button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
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

      {/* 订单详情弹窗 */}
      {isDetailOpen && detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[700px] max-w-[90vw] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-800">订单详情 - {detailOrder.orderNo}</h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">收货人：</span>{detailOrder.deliveryName}</div>
                <div><span className="text-gray-500">联系电话：</span>{detailOrder.deliveryPhone}</div>
                <div className="col-span-2"><span className="text-gray-500">收货地址：</span>{detailOrder.deliveryAddress}</div>
                <div><span className="text-gray-500">订单金额：</span>¥{detailOrder.totalAmount}</div>
                <div><span className="text-gray-500">实付金额：</span><span className="text-terracotta-500 font-bold">¥{detailOrder.actualAmount}</span></div>
                <div><span className="text-gray-500">支付方式：</span>{PAYMENT_METHOD_MAP[detailOrder.paymentMethod] || detailOrder.paymentMethod}</div>
                <div><span className="text-gray-500">订单状态：</span>{ORDER_STATUS_MAP[detailOrder.orderStatus]}</div>
                <div><span className="text-gray-500">创建时间：</span>{detailOrder.createdAt}</div>
                {detailOrder.remark && <div className="col-span-2"><span className="text-gray-500">备注：</span>{detailOrder.remark}</div>}
              </div>
              {detailOrder.orderItems && detailOrder.orderItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">商品列表</h4>
                  <table className="w-full text-sm border border-gray-200">
                    <thead><tr className="bg-gray-50"><th className="py-2 px-3 border text-center">商品</th><th className="py-2 px-3 border text-center">单价</th><th className="py-2 px-3 border text-center">数量</th><th className="py-2 px-3 border text-center">小计</th></tr></thead>
                    <tbody>
                      {detailOrder.orderItems.map((item, i) => (
                        <tr key={i}><td className="py-2 px-3 border text-center">{item.productName}</td><td className="py-2 px-3 border text-center">¥{item.productPrice}</td><td className="py-2 px-3 border text-center">{item.quantity}</td><td className="py-2 px-3 border text-center">¥{item.totalPrice}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

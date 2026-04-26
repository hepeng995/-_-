import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { getRegistrationPage, confirmRegistration, cancelRegistration } from '../api/activity';
import { activities } from '../mock/activityData';
import type { ActivityRegistration } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';
import { Search } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  confirmed: { label: '已确认', color: 'text-sprout-500 bg-sprout-50 border-sprout-200' },
  pending: { label: '待确认', color: 'text-harvest-500 bg-harvest-50 border-harvest-200' },
  cancelled: { label: '已取消', color: 'text-terracotta-500 bg-terracotta-50 border-terracotta-200' },
};

export default function ActivityRegistrations() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [list, setList] = useState<ActivityRegistration[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选状态
  const [filterActivityId, setFilterActivityId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getRegistrationPage({
        current,
        size: pageSize,
        activityId: filterActivityId ? Number(filterActivityId) : undefined,
        status: filterStatus || undefined,
      });
      if (res.code === 200 && res.data) {
        setList(res.data.records || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) {
      toast.error('获取报名列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [current, pageSize]);

  const handleSearch = () => {
    setCurrent(1);
    fetchData();
  };

  const handleReset = () => {
    setFilterActivityId('');
    setFilterStatus('');
    setCurrent(1);
  };

  const handleConfirm = async (item: ActivityRegistration) => {
    if (
      !(await confirm({
        message: `确定要确认 "${item.contactName}" 对 "${item.activityTitle}" 的报名吗？`,
        type: 'info',
      }))
    )
      return;
    try {
      await confirmRegistration(item.id);
      toast.success('确认报名成功');
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '确认失败');
    }
  };

  const handleCancel = async (item: ActivityRegistration) => {
    if (
      !(await confirm({
        message: `确定要取消 "${item.contactName}" 对 "${item.activityTitle}" 的报名吗？`,
        type: 'danger',
      }))
    )
      return;
    try {
      await cancelRegistration(item.id);
      toast.success('取消报名成功');
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '取消失败');
    }
  };

  const handleBatchConfirm = async () => {
    if (selectedIds.length === 0) return;
    if (!(await confirm({ message: `确定要确认选中的 ${selectedIds.length} 条报名吗？`, type: 'info' }))) return;
    try {
      for (const id of selectedIds) { await confirmRegistration(id); }
      setSelectedIds([]);
      fetchData();
      toast.success('批量确认成功');
    } catch (e: any) { toast.error(e?.response?.data?.message || '批量确认失败'); }
  };
  const handleBatchCancel = async () => {
    if (selectedIds.length === 0) return;
    if (!(await confirm({ message: `确定要取消选中的 ${selectedIds.length} 条报名吗？`, type: 'danger' }))) return;
    try {
      for (const id of selectedIds) { await cancelRegistration(id); }
      setSelectedIds([]);
      fetchData();
      toast.success('批量取消成功');
    } catch (e: any) { toast.error(e?.response?.data?.message || '批量取消失败'); }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedIds(e.target.checked ? list.map(r => r.id) : []); };
  const handleSelectOne = (id: number) => { setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]); };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {confirmDialog}

      {/* 筛选区域 */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">活动</label>
            <select
              value={filterActivityId}
              onChange={(e) => setFilterActivityId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 bg-white"
            >
              <option value="">全部活动</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">状态</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 bg-white"
            >
              <option value="">全部</option>
              <option value="confirmed">已确认</option>
              <option value="pending">待确认</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1"
          >
            <Search size={14} /> 查询
          </button>
          <button
            onClick={handleReset}
            className="bg-white border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm"
          >
            重置
          </button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleBatchConfirm} disabled={selectedIds.length === 0} className="bg-sprout-500 hover:bg-sprout-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">批量确认</button>
          <button onClick={handleBatchCancel} disabled={selectedIds.length === 0} className="bg-terracotta-500 hover:bg-terracotta-400 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">批量取消</button>
        </div>
      </Card>

      {/* 表格区域 */}
      <Card className="p-0 overflow-hidden">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-bold">
                <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={list.length > 0 && selectedIds.length === list.length} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
                <th className="py-3 px-4 text-center border border-gray-300">ID</th>
                <th className="py-3 px-4 text-center border border-gray-300">活动名称</th>
                <th className="py-3 px-4 text-center border border-gray-300">联系人</th>
                <th className="py-3 px-4 text-center border border-gray-300">手机号</th>
                <th className="py-3 px-4 text-center border border-gray-300">参加人数</th>
                <th className="py-3 px-4 text-center border border-gray-300">备注</th>
                <th className="py-3 px-4 text-center border border-gray-300">报名时间</th>
                <th className="py-3 px-4 text-center border border-gray-300">状态</th>
                <th className="py-3 px-4 text-center border border-gray-300">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {list.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.id}</td>
                  <td className="py-3 px-4 text-center border border-gray-300 max-w-[200px] truncate">
                    {item.activityTitle}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.contactName}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.contactPhone}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.participantCount}</td>
                  <td
                    className="py-3 px-4 text-center border border-gray-300 max-w-[160px] truncate"
                    title={item.remark}
                  >
                    {item.remark || '-'}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">{item.createdAt}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border ${
                        STATUS_MAP[item.status]?.color || ''
                      }`}
                    >
                      {STATUS_MAP[item.status]?.label || item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirm(item)}
                            className="bg-sprout-500 text-white px-3 py-1 rounded text-xs"
                          >
                            确认
                          </button>
                          <button
                            onClick={() => handleCancel(item)}
                            className="bg-terracotta-500 text-white px-3 py-1 rounded text-xs"
                          >
                            取消
                          </button>
                        </>
                      )}
                      {item.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(item)}
                          className="bg-harvest-500 text-white px-3 py-1 rounded text-xs"
                        >
                          取消报名
                        </button>
                      )}
                      {item.status === 'cancelled' && (
                        <span className="text-xs text-gray-400">已处理</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500 border border-gray-300">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 分页 */}
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <span className="mr-4">共 {total} 条</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrent(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 mr-4 bg-white"
          >
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent(Math.max(1, current - 1))}
              disabled={current <= 1}
              className="text-gray-400 disabled:opacity-50"
            >
              &lt;
            </button>
            <span>
              {current}/{totalPages || 1}
            </span>
            <button
              onClick={() => setCurrent(Math.min(totalPages, current + 1))}
              disabled={current >= totalPages}
              className="text-gray-400 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

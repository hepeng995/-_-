import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Clock, ChevronLeft, ChevronRight, MoreHorizontal, X } from 'lucide-react';
import * as logApi from '../api/system-log';
import type { SystemLog } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

export default function SystemLogs() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 分页
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选
  const [filterUsername, setFilterUsername] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterOperation, setFilterOperation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modules, setModules] = useState<string[]>([]);
  const [operationTypes, setOperationTypes] = useState<string[]>([]);

  useEffect(() => {
    logApi.getModules().then(res => { if (res.code === 200 && res.data) setModules(res.data); }).catch(() => {});
    logApi.getOperationTypes().then(res => { if (res.code === 200 && res.data) setOperationTypes(res.data); }).catch(() => {});
  }, []);

  useEffect(() => { fetchLogs(); }, [current, pageSize]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await logApi.getSystemLogPage({
        current, size: pageSize,
        username: filterUsername || undefined,
        module: filterModule || undefined,
        operation: filterOperation || undefined,
        status: filterStatus ? (filterStatus === '成功' ? 1 : 0) : undefined,
      });
      if (res.code === 200 && res.data) {
        setLogs(res.data.records || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) { console.error('获取日志失败:', e); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setCurrent(1); fetchLogs(); };
  const handleReset = () => { setFilterUsername(''); setFilterModule(''); setFilterOperation(''); setFilterStatus(''); setCurrent(1); };

  const handleOpenDetails = async (log: SystemLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!await confirm({ message: '确定要删除此日志吗？', type: 'danger' })) return;
    try { await logApi.deleteSystemLog(id); fetchLogs(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '删除失败'); }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm({ message: `确定要删除选中的 ${selectedIds.length} 条日志吗？`, type: 'danger' })) return;
    try { await logApi.batchDeleteSystemLogs(selectedIds); setSelectedIds([]); fetchLogs(); }
    catch (e: any) { toast.error(e?.response?.data?.message || '删除失败'); }
  };

  const handleClearLogs = async () => {
    if (!await confirm({ message: '确定要清空所有日志吗？此操作不可恢复！', type: 'danger' })) return;
    try { await logApi.clearSystemLogs(); fetchLogs(); toast.success('日志已清空'); }
    catch (e: any) { toast.error(e?.response?.data?.message || '清空失败'); }
  };

  const handleExport = async () => {
    try {
      const res = await logApi.exportSystemLogs({
        username: filterUsername || undefined, module: filterModule || undefined,
        operation: filterOperation || undefined, status: filterStatus ? (filterStatus === '成功' ? 1 : 0) : undefined,
      });
      const blob = new Blob([res as any], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `system_logs_${new Date().toISOString().slice(0,10)}.csv`;
      a.click(); window.URL.revokeObjectURL(url);
    } catch (e: any) { toast.error(e?.response?.data?.message || '导出失败'); }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? logs.map(l => l.id) : []);
  };
  const handleSelectOne = (id: number) => {
    setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {confirmDialog}
      {/* 筛选 */}
      <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <span className="text-gray-600 text-sm mr-2 whitespace-nowrap">用户名</span>
            <input type="text" value={filterUsername} onChange={(e) => setFilterUsername(e.target.value)} placeholder="请输入用户名" className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-400" />
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 text-sm mr-2 whitespace-nowrap">操作模块</span>
            <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-400 bg-white">
              <option value="">请选择操作模块</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 text-sm mr-2 whitespace-nowrap">操作类型</span>
            <select value={filterOperation} onChange={(e) => setFilterOperation(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-400 bg-white">
              <option value="">请选择操作类型</option>
              {operationTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 text-sm mr-2 whitespace-nowrap">操作状态</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-400 bg-white">
              <option value="">请选择操作状态</option>
              <option value="成功">成功</option><option value="失败">失败</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center mt-4">
          <button onClick={handleSearch} className="bg-[#409eff] hover:bg-[#66b1ff] text-white px-4 py-1.5 rounded text-sm transition-colors">搜索</button>
          <button onClick={handleReset} className="bg-white border border-gray-300 text-gray-600 hover:text-[#409eff] hover:border-[#409eff] px-4 py-1.5 rounded text-sm transition-colors">重置</button>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100">
        <div className="p-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">系统日志列表</h3>
          <div className="flex gap-2">
            <button onClick={handleExport} className="bg-[#409eff] hover:bg-[#66b1ff] text-white px-4 py-1.5 rounded text-sm transition-colors">导出</button>
            <button onClick={handleBatchDelete} disabled={selectedIds.length === 0} className="bg-[#e6a23c] hover:bg-[#ebb563] text-white px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50">批量删除</button>
            <button onClick={handleClearLogs} className="bg-[#f56c6c] hover:bg-[#f78989] text-white px-4 py-1.5 rounded text-sm transition-colors">清空日志</button>
          </div>
        </div>

        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-center border border-gray-300 w-12"><input type="checkbox" checked={logs.length > 0 && selectedIds.length === logs.length} onChange={handleSelectAll} className="rounded border-gray-300" /></th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center border border-gray-300 w-16">序号</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center border border-gray-300 w-24">操作用户</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center border border-gray-300 w-28">操作模块</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center border border-gray-300 w-32">操作类型</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center border border-gray-300">操作描述</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center border border-gray-300 w-36">IP地址</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center border border-gray-300 w-20">操作状态</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center border border-gray-300 w-24">耗时(ms)</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center border border-gray-300 w-40">操作时间</th>
                <th className="py-3 px-4 font-medium text-gray-600 text-center sticky right-0 bg-gray-50 z-20 border border-gray-300 w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-center border border-gray-300"><input type="checkbox" checked={selectedIds.includes(log.id)} onChange={() => handleSelectOne(log.id)} className="rounded border-gray-300" /></td>
                  <td className="py-3 px-4 text-gray-600 text-center border border-gray-300">{log.id}</td>
                  <td className="py-3 px-4 text-gray-600 text-center border border-gray-300">{log.username}</td>
                  <td className="py-3 px-4 text-gray-600 text-center border border-gray-300">{log.module}</td>
                  <td className="py-3 px-4 text-gray-600 text-center border border-gray-300">{log.operation}</td>
                  <td className="py-3 px-4 text-gray-600 text-center border border-gray-300 truncate" title={log.description}>{log.description}</td>
                  <td className="py-3 px-4 text-gray-600 text-center border border-gray-300">{log.ipAddress}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className={`px-2 py-0.5 rounded text-xs border ${log.status === 1 ? 'bg-green-50 text-green-500 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                      {log.status === 1 ? '成功' : '失败'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-center border border-gray-300">{log.executionTime}</td>
                  <td className="py-3 px-4 text-gray-600 text-center border border-gray-300">{log.createdAt}</td>
                  <td className="py-3 px-4 text-center sticky right-0 bg-white z-10 border border-gray-300">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleOpenDetails(log)} className="text-[#409eff] hover:text-[#66b1ff] text-sm">详情</button>
                      <button onClick={() => handleDelete(log.id)} className="text-[#f56c6c] hover:text-[#f78989] text-sm">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && <tr><td colSpan={11} className="py-8 text-center text-gray-400 border border-gray-300">暂无数据</td></tr>}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="p-4 flex items-center justify-between border-t border-gray-100 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>共 {total} 条</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }} className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-blue-400 bg-white">
              <option value={10}>10条/页</option><option value={20}>20条/页</option><option value={50}>50条/页</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1} className="p-1 hover:text-blue-500 disabled:text-gray-300"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-2">{current} / {totalPages || 1}</span>
            <button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages} className="p-1 hover:text-blue-500 disabled:text-gray-300"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-[800px] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-800">日志详情</h3>
              <button onClick={() => { setIsModalOpen(false); setSelectedLog(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <tbody>
                  <tr><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium w-32 border border-gray-200">操作用户</td><td colSpan={3} className="py-3 px-4 text-gray-800 border border-gray-200">{selectedLog.username}</td></tr>
                  <tr><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">操作模块</td><td className="py-3 px-4 text-gray-800 border border-gray-200">{selectedLog.module}</td><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">操作类型</td><td className="py-3 px-4 text-gray-800 border border-gray-200">{selectedLog.operation}</td></tr>
                  <tr><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">操作描述</td><td colSpan={3} className="py-3 px-4 text-gray-800 border border-gray-200">{selectedLog.description}</td></tr>
                  <tr><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">请求方法</td><td className="py-3 px-4 text-gray-800 border border-gray-200">{selectedLog.requestMethod}</td><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">请求URL</td><td className="py-3 px-4 text-gray-800 border border-gray-200">{selectedLog.requestUrl}</td></tr>
                  <tr><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">请求参数</td><td colSpan={3} className="py-3 px-4 border border-gray-200"><div className="bg-[#f8f9fa] p-3 rounded text-gray-600 font-mono text-xs break-all">{selectedLog.requestParams || '-'}</div></td></tr>
                  <tr><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">IP地址</td><td className="py-3 px-4 text-gray-800 border border-gray-200">{selectedLog.ipAddress}</td><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">操作状态</td><td className="py-3 px-4 border border-gray-200"><span className={`px-2 py-0.5 rounded text-xs border ${selectedLog.status === 1 ? 'bg-green-50 text-green-500 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>{selectedLog.status === 1 ? '成功' : '失败'}</span></td></tr>
                  <tr><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">执行时长</td><td className="py-3 px-4 text-gray-800 border border-gray-200">{selectedLog.executionTime} ms</td><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">操作时间</td><td className="py-3 px-4 text-gray-800 border border-gray-200">{selectedLog.createdAt}</td></tr>
                  {selectedLog.errorMessage && <tr><td className="py-3 px-4 bg-[#f8f9fa] text-gray-600 font-medium border border-gray-200">错误信息</td><td colSpan={3} className="py-3 px-4 text-red-600 border border-gray-200">{selectedLog.errorMessage}</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => { setIsModalOpen(false); setSelectedLog(null); }} className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:text-gray-800 text-sm">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

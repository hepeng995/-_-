import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { AlertCircle, User as UserIcon } from 'lucide-react';
import * as userApi from '../api/user';
import type { User } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

const ROLE_MAP: Record<string, string> = {
  USER: '普通用户',
  ADMIN: '超级管理员',
  STAFF: '工作人员',
};
const ROLE_OPTIONS = [
  { label: '超级管理员', value: 'ADMIN' },
  { label: '普通用户', value: 'USER' },
  { label: '工作人员', value: 'STAFF' },
];

export default function Users() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 分页
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选
  const [filterUsername, setFilterUsername] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // 表单
  const [formData, setFormData] = useState({
    username: '', realName: '', email: '', phoneNumber: '', password: '',
    role: 'USER' as string, enabled: true,
  });

  // 列宽
  const [columnWidths] = useState<{ [key: string]: number }>({
    checkbox: 50, username: 120, realName: 100, avatar: 80,
    email: 180, phone: 120, role: 100, status: 80,
    registerTime: 160, actions: 280,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await userApi.getUserList({
        current, size: pageSize,
        username: filterUsername || undefined,
        email: filterEmail || undefined,
        phoneNumber: filterPhone || undefined,
        enabled: filterStatus ? (filterStatus === '启用' ? true : false) : undefined,
      });
      if (res.code === 200 && res.data) {
        setUsers(res.data.records || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) {
      console.error('获取用户列表失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [current, pageSize]);

  const handleSearch = () => { setCurrent(1); fetchData(); };
  const handleResetFilters = () => {
    setFilterUsername(''); setFilterEmail(''); setFilterPhone(''); setFilterStatus('');
    setCurrent(1);
    setTimeout(() => fetchData(), 0);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ username: '', realName: '', email: '', phoneNumber: '', password: '', role: 'USER', enabled: true });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username, realName: user.realName || '', email: user.email || '',
      phoneNumber: user.phoneNumber || '', password: '', role: user.role, enabled: user.enabled,
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.realName) return;
    setSaving(true);
    try {
      if (modalMode === 'edit' && editingUser) {
        await userApi.updateUser(editingUser.id, {
          username: formData.username, realName: formData.realName,
          email: formData.email, phoneNumber: formData.phoneNumber, role: formData.role as any,
        });
      } else {
        await userApi.addUser({
          username: formData.username, realName: formData.realName,
          email: formData.email, phoneNumber: formData.phoneNumber,
          password: formData.password, role: formData.role as any,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: number) => { setUserToDelete(id); setIsDeleteModalOpen(true); };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await userApi.deleteUser(userToDelete);
      setSelectedIds(selectedIds.filter(id => id !== userToDelete));
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '删除失败');
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await userApi.updateUserStatus(user.id, !user.enabled);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '状态切换失败');
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!await confirm({ message: `确定要重置用户 "${user.username}" 的密码为默认密码 123456 吗？`, type: 'warning' })) return;
    try {
      await userApi.resetUserPassword(user.id);
      toast.success('密码已重置为 123456');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '重置失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!await confirm({ message: `确定要删除选中的 ${selectedIds.length} 个用户吗？`, type: 'danger' })) return;
    try {
      for (const id of selectedIds) { await userApi.deleteUser(id); }
      setSelectedIds([]);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '批量删除失败');
    }
  };

  const handleBatchStatus = async (enabled: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) { await userApi.updateUserStatus(id, enabled); }
      setSelectedIds([]);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '操作失败');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? users.map(u => u.id) : []);
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {confirmDialog}
      {/* 筛选 & 操作 */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">用户名</label>
            <input type="text" placeholder="请输入用户名" value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">邮箱</label>
            <input type="text" placeholder="请输入邮箱" value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">手机号</label>
            <input type="text" placeholder="请输入手机号" value={filterPhone}
              onChange={(e) => setFilterPhone(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">状态</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 bg-white transition-colors">
              <option value=""></option>
              <option value="启用">启用</option>
              <option value="禁用">禁用</option>
            </select>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <button onClick={handleSearch} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm transition-colors">查询</button>
            <button onClick={handleResetFilters} className="bg-white border border-gray-300 hover:text-bamboo-500 hover:border-bamboo-500 text-gray-600 px-4 py-1.5 rounded text-sm transition-colors">重置</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleOpenAdd} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-4 py-1.5 rounded text-sm transition-colors">添加用户</button>
          <button onClick={handleBatchDelete} disabled={selectedIds.length === 0}
            className="bg-terracotta-500 hover:bg-terracotta-400 text-white px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">批量删除</button>
          <button onClick={() => handleBatchStatus(false)} disabled={selectedIds.length === 0}
            className="bg-harvest-500 hover:bg-harvest-400 text-white px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">批量禁用</button>
          <button onClick={() => handleBatchStatus(true)} disabled={selectedIds.length === 0}
            className="bg-sprout-500 hover:bg-sprout-400 text-white px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">批量启用</button>
        </div>
      </Card>

      {/* 数据表格 */}
      <Card className="p-0 overflow-hidden">
        {loading && <div className="p-4 text-center text-sm text-gray-400">加载中...</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-bold">
                <th style={{ width: columnWidths.checkbox }} className="py-3 px-4 text-center border border-gray-300">
                  <input type="checkbox" checked={users.length > 0 && selectedIds.length === users.length}
                    onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" />
                </th>
                <th style={{ width: columnWidths.username }} className="py-3 px-4 text-center border border-gray-300">用户名</th>
                <th style={{ width: columnWidths.realName }} className="py-3 px-4 text-center border border-gray-300">真实姓名</th>
                <th style={{ width: columnWidths.avatar }} className="py-3 px-4 text-center border border-gray-300">头像</th>
                <th style={{ width: columnWidths.email }} className="py-3 px-4 text-center border border-gray-300">邮箱</th>
                <th style={{ width: columnWidths.phone }} className="py-3 px-4 text-center border border-gray-300">手机号</th>
                <th style={{ width: columnWidths.role }} className="py-3 px-4 text-center border border-gray-300">角色</th>
                <th style={{ width: columnWidths.status }} className="py-3 px-4 text-center border border-gray-300">状态</th>
                <th style={{ width: columnWidths.registerTime }} className="py-3 px-4 text-center border border-gray-300">注册时间</th>
                <th style={{ width: columnWidths.actions }} className="py-3 px-4 text-center sticky right-0 bg-gray-50 z-20 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] border border-gray-300">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {users.length > 0 ? users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => handleSelectOne(user.id)} className="rounded border-gray-300 cursor-pointer" />
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 truncate" title={user.username}>{user.username}</td>
                  <td className="py-3 px-4 text-center border border-gray-300 truncate" title={user.realName}>{user.realName}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full mx-auto object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mx-auto">
                        <UserIcon size={16} />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 truncate" title={user.email}>{user.email}</td>
                  <td className="py-3 px-4 text-center border border-gray-300 truncate" title={user.phoneNumber}>{user.phoneNumber}</td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className="text-sprout-500 bg-sprout-50 border border-sprout-200 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                      {ROLE_MAP[user.role] || user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300">
                    <span className={`px-2 py-0.5 rounded text-xs border whitespace-nowrap ${
                      user.enabled ? 'text-sprout-500 bg-sprout-50 border-sprout-200' : 'text-terracotta-500 bg-terracotta-50 border-terracotta-200'
                    }`}>
                      {user.enabled ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center border border-gray-300 truncate" title={user.createdAt}>{user.createdAt}</td>
                  <td className="py-3 px-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 transition-colors z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] border border-gray-300">
                    <div className="flex items-center justify-center gap-2 flex-wrap w-max mx-auto">
                      <button onClick={() => handleOpenEdit(user)} className="bg-bamboo-500 hover:bg-bamboo-400 text-white px-3 py-1 rounded text-xs transition-colors whitespace-nowrap">编辑</button>
                      <button onClick={() => toggleUserStatus(user)} className="bg-harvest-500 hover:bg-harvest-400 text-white px-3 py-1 rounded text-xs transition-colors whitespace-nowrap">
                        {user.enabled ? '禁用' : '启用'}
                      </button>
                      <button onClick={() => handleResetPassword(user)} className="bg-gray-500 hover:bg-gray-400 text-white px-3 py-1 rounded text-xs transition-colors whitespace-nowrap">重置密码</button>
                      <button onClick={() => confirmDelete(user.id)} className="bg-terracotta-500 hover:bg-terracotta-400 text-white px-3 py-1 rounded text-xs transition-colors whitespace-nowrap">删除</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500 border border-gray-300">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="p-4 border-t border-gray-100 flex items-center text-sm text-gray-600">
          <span className="mr-4">共 {total} 条</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }}
            className="border border-gray-300 rounded px-2 py-1 mr-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 bg-white transition-colors">
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </select>
          <div className="flex items-center gap-2 mr-4">
            <button onClick={() => setCurrent(Math.max(1, current - 1))} disabled={current <= 1}
              className="text-gray-400 hover:text-bamboo-500 disabled:opacity-50 transition-colors">&lt;</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button key={page} onClick={() => setCurrent(page)}
                  className={`${page === current ? 'text-bamboo-500 font-bold' : 'text-gray-400 hover:text-bamboo-500'}`}>{page}</button>
              );
            })}
            <button onClick={() => setCurrent(Math.min(totalPages, current + 1))} disabled={current >= totalPages}
              className="text-gray-400 hover:text-bamboo-500 disabled:opacity-50 transition-colors">&gt;</button>
          </div>
          <div className="flex items-center gap-2">
            <span>前往</span>
            <input type="number" min={1} max={totalPages} value={current}
              onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= totalPages) setCurrent(v); }}
              className="border border-gray-300 rounded w-12 text-center py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 transition-colors" />
            <span>页</span>
          </div>
        </div>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'edit' ? "编辑用户" : "新增用户"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" placeholder="输入用户名" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">真实姓名</label>
            <input type="text" value={formData.realName} onChange={(e) => setFormData({...formData, realName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" placeholder="输入真实姓名" />
          </div>
          {modalMode === 'add' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" placeholder="输入密码" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" placeholder="输入邮箱" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" placeholder="输入手机号" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 bg-white">
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select value={formData.enabled ? 'true' : 'false'} onChange={(e) => setFormData({...formData, enabled: e.target.value === 'true'})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 bg-white">
              <option value="true">启用</option>
              <option value="false">禁用</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:text-bamboo-500 hover:border-bamboo-500">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-bamboo-500 rounded hover:bg-bamboo-400 disabled:opacity-50">
              {saving ? '保存中...' : '确定'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="提示">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="text-harvest-500" size={24} />
            <p className="text-gray-700">此操作将永久删除该用户, 是否继续?</p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:text-bamboo-500">取消</button>
            <button onClick={handleDelete} className="px-4 py-1.5 text-sm font-medium text-white bg-bamboo-500 rounded hover:bg-bamboo-400">确定</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

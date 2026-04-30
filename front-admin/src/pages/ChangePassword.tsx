import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import * as userApi from '../api/user';

export default function ChangePassword() {
  const { logout } = useAuth();
  const toast = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    if (newPassword.length < 6) {
      setError('新密码长度不能少于6位');
      return;
    }
    setSaving(true);
    try {
      await userApi.changePassword({ oldPassword, newPassword });
      toast.success('密码修改成功，请重新登录');
      logout();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || '密码修改失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] justify-center pt-2 sm:pt-6">
      <div className="w-full max-w-[600px]">
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-ink-600">修改密码</h2>
          </div>
          <div className="p-5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {error && (
                <div className="bg-terracotta-50 border border-terracotta-200 text-terracotta-500 text-sm rounded px-4 py-3">{error}</div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="text-sm text-gray-600 sm:mr-4 sm:w-24 sm:text-right"><span className="mr-1 text-red-500">*</span>原密码</label>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="请输入原密码" className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="text-sm text-gray-600 sm:mr-4 sm:w-24 sm:text-right"><span className="mr-1 text-red-500">*</span>新密码</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="请输入新密码" className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="text-sm text-gray-600 sm:mr-4 sm:w-24 sm:text-right"><span className="mr-1 text-red-500">*</span>确认密码</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="请再次输入新密码" className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:pl-28">
                <button type="submit" disabled={saving} className="w-full rounded-2xl bg-bamboo-500 px-6 py-2 text-sm text-white transition-colors hover:bg-bamboo-400 disabled:opacity-50 sm:mr-4 sm:w-auto sm:rounded">
                  {saving ? '提交中...' : '确认修改'}
                </button>
                <button type="button" onClick={() => { setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setError(''); }} className="w-full rounded-2xl border border-gray-300 bg-white px-6 py-2 text-sm text-gray-600 transition-colors hover:border-bamboo-500 hover:text-bamboo-500 sm:w-auto sm:rounded">重置</button>
              </div>
            </form>
            <div className="mt-6 rounded bg-gray-50 p-4 sm:mt-8 sm:p-5">
              <h4 className="text-gray-700 font-medium mb-3 text-sm">温馨提示:</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-500">
                <li>密码修改成功后，系统将自动退出并跳转到登录页面</li>
                <li>请使用字母、数字和特殊字符的组合，提高密码安全性</li>
                <li>新密码长度不能少于6位</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

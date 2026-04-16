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
    <div className="flex justify-center items-start min-h-[calc(100vh-100px)] pt-10">
      <div className="w-full max-w-[600px]">
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#1b2559]">修改密码</h2>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded px-4 py-3">{error}</div>
              )}
              <div className="flex items-center">
                <label className="w-24 text-right mr-4 text-gray-600 text-sm"><span className="text-red-500 mr-1">*</span>原密码</label>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="请输入原密码" className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#409eff]" />
              </div>
              <div className="flex items-center">
                <label className="w-24 text-right mr-4 text-gray-600 text-sm"><span className="text-red-500 mr-1">*</span>新密码</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="请输入新密码" className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#409eff]" />
              </div>
              <div className="flex items-center">
                <label className="w-24 text-right mr-4 text-gray-600 text-sm"><span className="text-red-500 mr-1">*</span>确认密码</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="请再次输入新密码" className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#409eff]" />
              </div>
              <div className="flex items-center pl-28 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2 bg-[#409eff] hover:bg-[#66b1ff] text-white text-sm rounded transition-colors mr-4 disabled:opacity-50">
                  {saving ? '提交中...' : '确认修改'}
                </button>
                <button type="button" onClick={() => { setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setError(''); }} className="px-6 py-2 bg-white border border-gray-300 text-gray-600 text-sm rounded hover:text-[#409eff] hover:border-[#409eff] transition-colors">重置</button>
              </div>
            </form>
            <div className="mt-8 bg-[#f8f9fa] p-5 rounded">
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

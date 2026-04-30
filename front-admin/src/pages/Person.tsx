import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import * as userApi from '../api/user';
import * as fileApi from '../api/file';

export default function Person() {
  const { userInfo, updateUserInfo, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // 密码修改表单
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // 个人资料表单
  const [profileForm, setProfileForm] = useState({
    realName: userInfo?.realName || '',
    email: userInfo?.email || '',
    phoneNumber: userInfo?.phoneNumber || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('请填写所有字段');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('两次输入的新密码不一致');
      return;
    }
    setSaving(true);
    try {
      await userApi.changePassword({ oldPassword, newPassword });
      toast.success('密码修改成功，请重新登录');
      logout();
    } catch (e: any) {
      setMessage(e?.response?.data?.message || e?.message || '密码修改失败');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      await userApi.updateProfile(profileForm);
      updateUserInfo(profileForm);
      toast.success('个人资料更新成功');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '更新失败');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await fileApi.uploadFile(file);
      if (res.data?.code === 200 && res.data?.data) {
        await userApi.updateAvatar({ avatar: res.data.data.url });
        updateUserInfo({ avatar: res.data.data.url });
        toast.success('头像更新成功');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '头像上传失败');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] justify-center pt-2 sm:pt-6">
      <div className="w-full max-w-[800px] space-y-4 sm:space-y-6">
        {/* 个人资料 */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-normal text-gray-800">个人资料</h2>
          </div>
          <div className="space-y-5 p-5 sm:p-8">
            {/* 头像 */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm text-gray-600 sm:mr-4 sm:w-24 sm:text-right">头像</label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <img src={userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} alt="" className="w-16 h-16 rounded-full object-cover" />
                <label className="w-full cursor-pointer rounded-2xl border border-gray-300 bg-white px-4 py-2 text-center text-sm text-gray-600 transition-colors hover:border-bamboo-500 hover:text-bamboo-500 sm:w-auto sm:rounded">
                  更换头像
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>
            {/* 用户名（只读） */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm text-gray-600 sm:mr-4 sm:w-24 sm:text-right">用户名</label>
              <input type="text" value={userInfo?.username || ''} disabled className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
            </div>
            {/* 角色（只读） */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm text-gray-600 sm:mr-4 sm:w-24 sm:text-right">角色</label>
              <input type="text" value={userInfo?.role || ''} disabled className="flex-1 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
            </div>
            {/* 真实姓名 */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm text-gray-600 sm:mr-4 sm:w-24 sm:text-right"><span className="mr-1 text-red-500">*</span>真实姓名</label>
              <input type="text" value={profileForm.realName} onChange={(e) => setProfileForm({...profileForm, realName: e.target.value})} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
            </div>
            {/* 邮箱 */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm text-gray-600 sm:mr-4 sm:w-24 sm:text-right">邮箱</label>
              <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
            </div>
            {/* 手机号 */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm text-gray-600 sm:mr-4 sm:w-24 sm:text-right">手机号</label>
              <input type="text" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
            </div>
            <div className="pt-2 sm:pl-28">
              <button onClick={handleProfileSave} disabled={profileSaving} className="w-full rounded-2xl bg-bamboo-500 px-6 py-2 text-sm text-white transition-colors hover:bg-bamboo-400 disabled:opacity-50 sm:w-auto sm:rounded">
                {profileSaving ? '保存中...' : '保存资料'}
              </button>
            </div>
          </div>
        </div>

        {/* 修改密码 */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-normal text-gray-800">修改密码</h2>
          </div>
          <div className="p-5 sm:p-8">
            <form onSubmit={handlePasswordSubmit} className="space-y-5 sm:space-y-6">
              {message && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded px-4 py-3">{message}</div>}
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
                <button type="button" onClick={() => { setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setMessage(''); }} className="w-full rounded-2xl border border-gray-300 bg-white px-6 py-2 text-sm text-gray-600 transition-colors hover:border-bamboo-500 hover:text-bamboo-500 sm:w-auto sm:rounded">重置</button>
              </div>
            </form>
            <div className="mt-6 rounded bg-gray-50 p-4 sm:mt-8 sm:p-5">
              <h4 className="text-gray-700 font-medium mb-3 text-sm">温馨提示:</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-500">
                <li>密码修改成功后，系统将自动退出并跳转到登录页面</li>
                <li>请使用字母、数字和特殊字符的组合，提高密码安全性</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

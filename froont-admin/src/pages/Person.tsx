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
    <div className="flex justify-center items-start min-h-[calc(100vh-100px)] pt-10">
      <div className="w-full max-w-[800px] space-y-6">
        {/* 个人资料 */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-normal text-gray-800">个人资料</h2>
          </div>
          <div className="p-8 space-y-6">
            {/* 头像 */}
            <div className="flex items-center">
              <label className="w-24 text-right mr-4 text-gray-600 text-sm">头像</label>
              <div className="flex items-center gap-4">
                <img src={userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} alt="" className="w-16 h-16 rounded-full object-cover" />
                <label className="px-4 py-2 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:text-[#409eff] hover:border-[#409eff] cursor-pointer transition-colors">
                  更换头像
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>
            {/* 用户名（只读） */}
            <div className="flex items-center">
              <label className="w-24 text-right mr-4 text-gray-600 text-sm">用户名</label>
              <input type="text" value={userInfo?.username || ''} disabled className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded text-sm cursor-not-allowed" />
            </div>
            {/* 角色（只读） */}
            <div className="flex items-center">
              <label className="w-24 text-right mr-4 text-gray-600 text-sm">角色</label>
              <input type="text" value={userInfo?.role || ''} disabled className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded text-sm cursor-not-allowed" />
            </div>
            {/* 真实姓名 */}
            <div className="flex items-center">
              <label className="w-24 text-right mr-4 text-gray-600 text-sm"><span className="text-red-500 mr-1">*</span>真实姓名</label>
              <input type="text" value={profileForm.realName} onChange={(e) => setProfileForm({...profileForm, realName: e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#409eff]" />
            </div>
            {/* 邮箱 */}
            <div className="flex items-center">
              <label className="w-24 text-right mr-4 text-gray-600 text-sm">邮箱</label>
              <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#409eff]" />
            </div>
            {/* 手机号 */}
            <div className="flex items-center">
              <label className="w-24 text-right mr-4 text-gray-600 text-sm">手机号</label>
              <input type="text" value={profileForm.phoneNumber} onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#409eff]" />
            </div>
            <div className="flex items-center pl-28 pt-2">
              <button onClick={handleProfileSave} disabled={profileSaving} className="px-6 py-2 bg-[#409eff] hover:bg-[#66b1ff] text-white text-sm rounded transition-colors disabled:opacity-50">
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
          <div className="p-8">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {message && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded px-4 py-3">{message}</div>}
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
                <button type="button" onClick={() => { setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setMessage(''); }} className="px-6 py-2 bg-white border border-gray-300 text-gray-600 text-sm rounded hover:text-[#409eff] hover:border-[#409eff] transition-colors">重置</button>
              </div>
            </form>
            <div className="mt-8 bg-[#f8f9fa] p-5 rounded">
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

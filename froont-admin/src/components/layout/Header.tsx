import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Settings, LogOut, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { userInfo, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = userInfo?.realName || userInfo?.username || '管理员';
  const displayRole = userInfo?.role === 'ADMIN' ? '超级管理员' : userInfo?.role === 'STAFF' ? '工作人员' : '普通用户';
  const avatarUrl = userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin';

  return (
    <header className="h-20 px-8 flex items-center justify-end bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <a
          href="http://localhost:3000"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-full transition-all"
          title="返回前台"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">返回前台</span>
        </a>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">通知</h3>
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full font-medium">暂无新通知</span>
              </div>
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                暂无通知
              </div>
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-3 pl-2 border-l border-gray-200" ref={profileRef}>
          <div className="hidden md:block text-right cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <p className="text-sm font-bold text-gray-700 leading-tight">{displayName}</p>
            <p className="text-xs text-gray-500">{displayRole}</p>
          </div>
          <img
            src={avatarUrl}
            alt="Profile"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full cursor-pointer bg-indigo-50 border-2 border-transparent hover:border-indigo-200 transition-all"
          />

          {isProfileOpen && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                <p className="text-sm font-bold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{displayRole}</p>
              </div>
              <div className="py-1">
                <Link to="/person" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                  <User className="w-4 h-4 mr-2" />
                  个人中心
                </Link>
                <Link to="/system-config" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  系统配置
                </Link>
              </div>
              <div className="border-t border-gray-50 py-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

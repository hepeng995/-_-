import { useState, useRef, useEffect } from 'react';
import { Bell, User, Settings, LogOut, Home, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { findActiveNavLabel } from './navigation';

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { userInfo, logout } = useAuth();
  const location = useLocation();
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
  const avatarUrl = userInfo?.avatar;
  const currentLabel = findActiveNavLabel(location.pathname);
  const frontUrl = (() => {
    if (import.meta.env.VITE_FRONT_URL) return import.meta.env.VITE_FRONT_URL;
    const { protocol, hostname, port, origin } = window.location;
    if (import.meta.env.DEV && port === '3001') {
      return `${protocol}//${hostname}:3000`;
    }
    return origin;
  })();

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/90 px-3 shadow-[0_4px_18px_rgba(12,27,36,0.06)] backdrop-blur-md sm:h-18 sm:px-4 md:left-64 lg:h-20 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 text-gray-600 transition-colors hover:border-bamboo-200 hover:text-bamboo-500 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 md:hidden">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">后台管理</p>
          <p className="truncate text-sm font-semibold text-ink-600">{currentLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        <a
          href={frontUrl}
          className="flex items-center gap-1.5 rounded-full px-2 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-bamboo-50 hover:text-bamboo-500 sm:px-3"
          title="返回前台"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">返回前台</span>
        </a>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-full p-2 text-gray-400 transition-all hover:bg-bamboo-50 hover:text-bamboo-500"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">通知</h3>
                <span className="text-xs text-bamboo-500 bg-bamboo-50 px-2 py-1 rounded-full font-medium">暂无新通知</span>
              </div>
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                暂无通知
              </div>
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-2 border-l border-gray-200 pl-2 sm:gap-3" ref={profileRef}>
          <div className="hidden md:block text-right cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <p className="text-sm font-bold text-gray-700 leading-tight">{displayName}</p>
            <p className="text-xs text-gray-500">{displayRole}</p>
          </div>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full cursor-pointer bg-bamboo-50 border-2 border-transparent hover:border-bamboo-200 transition-all"
            />
          ) : (
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full cursor-pointer bg-bamboo-50 border-2 border-transparent hover:border-bamboo-200 transition-all flex items-center justify-center"
            >
              <User className="w-5 h-5 text-bamboo-500" />
            </div>
          )}

          {isProfileOpen && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                <p className="text-sm font-bold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{displayRole}</p>
              </div>
              <div className="py-1">
                <Link to="/person" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-bamboo-500 transition-colors">
                  <User className="w-4 h-4 mr-2" />
                  个人中心
                </Link>
                <Link to="/system-config" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-bamboo-500 transition-colors">
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

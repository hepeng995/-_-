import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import {
  MapPin, ShoppingBag, ShoppingCart, FileText, TrendingUp,
  ClipboardList, MessageSquare, MessageCircle, User, Settings,
  Monitor, Cpu, Shield, Clock, Activity, PieChart as PieChartIcon,
  Sprout
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as homeApi from '../api/home';
import * as forumApi from '../api/forum';
import * as orderApi from '../api/order';

const DIST_COLORS = ['#4A8FA8', '#D49E42', '#2AAA8A', '#1E7A52'];

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  // 统计数据
  const [stats, setStats] = useState({
    attractionCount: 0, productCount: 0, orderCount: 0, newsCount: 0,
    totalPosts: 0, totalComments: 0, activeUsers: 0,
    pendingPayment: 0, paid: 0, shipped: 0, completed: 0, cancelled: 0,
  });
  const [distributionData, setDistributionData] = useState([
    { name: '景点管理', value: 0 },
    { name: '商品管理', value: 0 },
    { name: '订单管理', value: 0 },
    { name: '资讯管理', value: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 并行获取所有数据
        const [statsRes, forumRes, orderRes] = await Promise.allSettled([
          homeApi.getHomeStats(),
          forumApi.getForumOverview(),
          orderApi.getOrderStats(),
        ]);

        let attractionCount = 0, productCount = 0, orderCount = 0, newsCount = 0;
        if (statsRes.status === 'fulfilled' && statsRes.value.code === 200 && statsRes.value.data) {
          const d = statsRes.value.data;
          attractionCount = d.attractionCount || 0;
          productCount = d.productCount || 0;
          orderCount = d.orderCount || 0;
          newsCount = d.newsCount || 0;
        }

        let totalPosts = 0, totalComments = 0, activeUsers = 0;
        if (forumRes.status === 'fulfilled' && forumRes.value.code === 200 && forumRes.value.data) {
          const d = forumRes.value.data;
          totalPosts = d.totalPosts || 0;
          totalComments = d.totalComments || 0;
          activeUsers = d.activeUsers || 0;
        }

        let pendingPayment = 0, paid = 0, shipped = 0, completed = 0, cancelled = 0;
        if (orderRes.status === 'fulfilled' && orderRes.value.code === 200 && orderRes.value.data) {
          const d = orderRes.value.data as any;
          if (d.statusStats && Array.isArray(d.statusStats)) {
            const statusMap: Record<string, number> = {};
            d.statusStats.forEach((s: any) => { statusMap[s.status] = s.count; });
            pendingPayment = statusMap['PENDING'] || 0;
            paid = statusMap['PAID'] || 0;
            shipped = statusMap['SHIPPED'] || 0;
            completed = statusMap['COMPLETED'] || 0;
            cancelled = statusMap['CANCELLED'] || 0;
          }
        }

        setStats({ attractionCount, productCount, orderCount, newsCount, totalPosts, totalComments, activeUsers, pendingPayment, paid, shipped, completed, cancelled });
        setDistributionData([
          { name: '景点管理', value: attractionCount },
          { name: '商品管理', value: productCount },
          { name: '订单管理', value: orderCount },
          { name: '资讯管理', value: newsCount },
        ]);
      } catch (e) {
        console.error('获取仪表盘数据失败:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString('zh-CN', { hour12: false });
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('zh-CN', options);
  };

  const totalOrders = stats.pendingPayment + stats.paid + stats.shipped + stats.completed + stats.cancelled;
  const maxOrders = Math.max(totalOrders, 1);

  return (
    <div className="space-y-6">
      {/* 顶部横幅 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:col-span-9 lg:flex-row lg:items-center lg:gap-8 lg:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-bamboo-50 blur-3xl -mr-16 -mt-16 sm:h-64 sm:w-64 sm:-mr-20 sm:-mt-20"></div>
          <div className="relative z-10">
            <h2 className="flex items-center gap-3 text-xl font-bold text-ink-600 sm:text-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bamboo-100 shadow-inner"><Sprout className="h-5 w-5 text-bamboo-500" /></div>
              乡村振兴·智兴乡村平台
            </h2>
            <p className="mt-3 text-sm text-gray-500">数据驱动决策，智慧助力乡村振兴发展</p>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-gray-50 pt-5 sm:grid-cols-3 sm:gap-6 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-10">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">景点总数</p>
              <p className="text-2xl font-bold text-ink-600">{stats.attractionCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">商品总数</p>
              <p className="text-2xl font-bold text-ink-600">{stats.productCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">订单总数</p>
              <p className="text-2xl font-bold text-ink-600">{stats.orderCount}</p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-ink-600 p-5 text-white shadow-sm sm:p-8 lg:col-span-3">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-bamboo-400 via-transparent to-transparent"></div>
          <div className="relative z-10 text-center w-full">
            <div className="text-sm text-bamboo-200 font-medium tracking-widest uppercase mb-3">当前时间</div>
            <div className="mb-4 font-mono text-3xl font-light tracking-tight tabular-nums sm:text-4xl lg:text-5xl">{formatTime(time)}</div>
            <div className="inline-block rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-medium text-bamboo-100 backdrop-blur-sm">
              {formatDate(time)}
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <Card className="p-5 sm:p-6">
          <div className="w-12 h-12 rounded-lg bg-lotus-500 flex items-center justify-center text-white mb-4 shadow-sm"><MapPin size={24} /></div>
          <h3 className="text-3xl font-bold text-ink-600">{stats.attractionCount}</h3>
          <p className="text-sm text-gray-500 mt-1">景点总数</p>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="w-12 h-12 rounded-lg bg-lotus-500 flex items-center justify-center text-white mb-4 shadow-sm"><ShoppingBag size={24} /></div>
          <h3 className="text-3xl font-bold text-ink-600">{stats.productCount}</h3>
          <p className="text-sm text-gray-500 mt-1">商品总数</p>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="w-12 h-12 rounded-lg bg-lotus-300 flex items-center justify-center text-white mb-4 shadow-sm"><ShoppingCart size={24} /></div>
          <h3 className="text-3xl font-bold text-ink-600">{stats.orderCount}</h3>
          <p className="text-sm text-gray-500 mt-1">订单总数</p>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="w-12 h-12 rounded-lg bg-lotus-300 flex items-center justify-center text-white mb-4 shadow-sm"><FileText size={24} /></div>
          <h3 className="text-3xl font-bold text-ink-600">{stats.newsCount}</h3>
          <p className="text-sm text-gray-500 mt-1">资讯总数</p>
        </Card>
      </div>

      {/* 图表行 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-ink-600 flex items-center gap-2">
              <Activity size={18} className="text-lotus-500" /> 业务分布
            </h3>
          </div>
          <div className="relative flex h-72 flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={0} dataKey="value" stroke="none">
                  {distributionData.map((_, index) => <Cell key={`cell-${index}`} fill={DIST_COLORS[index % DIST_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid w-full grid-cols-1 gap-x-2 gap-y-3 px-1 sm:grid-cols-2 sm:px-4">
              {distributionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: DIST_COLORS[index] }}></div>
                  <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-ink-600 mb-6 flex items-center gap-2">
            <ClipboardList size={18} className="text-lotus-500" /> 订单状态
          </h3>
          <div className="space-y-6">
            {[
              { label: '待付款', value: stats.pendingPayment, color: 'bg-terracotta-400' },
              { label: '已付款', value: stats.paid, color: 'bg-sprout-500' },
              { label: '已发货', value: stats.shipped, color: 'bg-sky-300' },
              { label: '已完成', value: stats.completed, color: 'bg-gray-400' },
              { label: '已取消', value: stats.cancelled, color: 'bg-gray-300' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-bold text-lotus-500">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${(item.value / maxOrders) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 底部行 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
        <Card className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-ink-600 mb-6 flex items-center gap-2">
            <MessageSquare size={18} className="text-lotus-500" /> 论坛活跃度
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 sm:gap-4">
              <div className="w-12 h-12 rounded-lg bg-lotus-500 flex items-center justify-center text-white"><FileText size={24} /></div>
              <div>
                <h4 className="text-xl font-bold text-ink-600">{stats.totalPosts}</h4>
                <p className="text-sm text-gray-500">总帖子数</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 sm:gap-4">
              <div className="w-12 h-12 rounded-lg bg-lotus-500 flex items-center justify-center text-white"><MessageCircle size={24} /></div>
              <div>
                <h4 className="text-xl font-bold text-ink-600">{stats.totalComments}</h4>
                <p className="text-sm text-gray-500">总评论数</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 sm:gap-4">
              <div className="w-12 h-12 rounded-lg bg-lotus-300 flex items-center justify-center text-white"><User size={24} /></div>
              <div>
                <h4 className="text-xl font-bold text-ink-600">{stats.activeUsers}</h4>
                <p className="text-sm text-gray-500">活跃用户</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-ink-600 mb-6 flex items-center gap-2">
            <Settings size={18} className="text-lotus-500" /> 快捷操作
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <button onClick={() => navigate('/attractions')} className="bg-bamboo-500 hover:bg-bamboo-400 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <MapPin size={16} /> 管理景点
            </button>
            <button onClick={() => navigate('/products')} className="bg-sprout-500 hover:bg-sprout-400 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <ShoppingBag size={16} /> 管理商品
            </button>
            <button onClick={() => navigate('/orders')} className="bg-harvest-500 hover:bg-harvest-400 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <ShoppingCart size={16} /> 订单管理
            </button>
            <button onClick={() => navigate('/news')} className="bg-sky-500 hover:bg-sky-400 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <FileText size={16} /> 发布资讯
            </button>
            <button onClick={() => navigate('/forum-posts')} className="bg-bamboo-500 hover:bg-bamboo-400 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <MessageSquare size={16} /> 论坛管理
            </button>
            <button onClick={() => navigate('/system-logs')} className="bg-terracotta-500 hover:bg-terracotta-400 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
              <Monitor size={16} /> 系统日志
            </button>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-ink-600 mb-6 flex items-center gap-2">
            <Settings size={18} className="text-lotus-500" /> 系统信息
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-lotus-500 flex items-center justify-center text-white"><Cpu size={20} /></div>
              <div>
                <p className="text-xs text-gray-500">系统版本</p>
                <h4 className="text-sm font-bold text-ink-600">v1.0.0</h4>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-lotus-500 flex items-center justify-center text-white"><User size={20} /></div>
              <div>
                <p className="text-xs text-gray-500">登录用户</p>
                <h4 className="text-sm font-bold text-ink-600">{userInfo?.realName || userInfo?.username || 'admin'}</h4>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-lotus-500 flex items-center justify-center text-white"><Shield size={20} /></div>
              <div>
                <p className="text-xs text-gray-500">用户角色</p>
                <h4 className="text-sm font-bold text-ink-600">{userInfo?.role || 'ADMIN'}</h4>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-lotus-500 flex items-center justify-center text-white"><Clock size={20} /></div>
              <div>
                <p className="text-xs text-gray-500">运行时间</p>
                <h4 className="text-sm font-bold text-ink-600">运行中</h4>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

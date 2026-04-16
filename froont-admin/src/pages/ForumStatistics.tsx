import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { RefreshCw, FileText, MessageCircle, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import * as forumApi from '../api/forum';
import type { ForumOverview } from '../types';

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function ForumStatistics() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ForumOverview>({ totalPosts: 0, approvedPosts: 0, pendingPosts: 0, rejectedPosts: 0, totalComments: 0, activeUsers: 0 });
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [auditData, setAuditData] = useState({ approved: 0, pending: 0, rejected: 0 });
  const [hotPosts, setHotPosts] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewRes, catRes, auditRes, hotRes, monthRes] = await Promise.allSettled([
        forumApi.getForumOverview(),
        forumApi.getCategoryDistribution(),
        forumApi.getAuditStatus(),
        forumApi.getHotRanking(),
        forumApi.getMonthlyTrend(),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value.code === 200 && overviewRes.value.data) setOverview(overviewRes.value.data);
      if (catRes.status === 'fulfilled' && catRes.value.code === 200 && catRes.value.data) setCategoryData(catRes.value.data);
      if (auditRes.status === 'fulfilled' && auditRes.value.code === 200 && auditRes.value.data) setAuditData(auditRes.value.data);
      if (hotRes.status === 'fulfilled' && hotRes.value.code === 200 && hotRes.value.data) setHotPosts(hotRes.value.data);
      if (monthRes.status === 'fulfilled' && monthRes.value.code === 200 && monthRes.value.data) setMonthlyData(monthRes.value.data);
    } catch (e) { console.error('获取统计数据失败:', e); }
    finally { setLoading(false); }
  };

  const auditChartData = [
    { name: '已通过', value: auditData.approved, color: '#67c23a' },
    { name: '待审核', value: auditData.pending, color: '#e6a23c' },
    { name: '已拒绝', value: auditData.rejected, color: '#f56c6c' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1b2559]">论坛数据分析</h2>
        <button onClick={fetchAllData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:text-[#409eff] hover:border-[#409eff] disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 刷新数据
        </button>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">加载中...</div> : (
        <>
          {/* 概览卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: '总帖子数', value: overview.totalPosts, icon: FileText, color: '#8b5cf6' },
              { label: '已通过', value: overview.approvedPosts, icon: CheckCircle, color: '#67c23a' },
              { label: '待审核', value: overview.pendingPosts, icon: Clock, color: '#e6a23c' },
              { label: '已拒绝', value: overview.rejectedPosts, icon: XCircle, color: '#f56c6c' },
              { label: '总评论数', value: overview.totalComments, icon: MessageCircle, color: '#06b6d4' },
              { label: '活跃用户', value: overview.activeUsers, icon: Users, color: '#10b981' },
            ].map(({ label, value, icon: Icon, color }) => (
              <React.Fragment key={label}>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: color }}><Icon size={18} /></div>
                    <div>
                      <p className="text-2xl font-bold text-[#1b2559]">{value}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  </div>
                </Card>
              </React.Fragment>
            ))}
          </div>

          {/* 图表行 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 分类分布 */}
            <Card className="p-6">
              <h3 className="text-base font-bold text-[#1b2559] mb-4">建议类型分布</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart><Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie><RechartsTooltip /><Legend /></PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[300px] flex items-center justify-center text-gray-400">暂无数据</div>}
            </Card>

            {/* 审核状态 */}
            <Card className="p-6">
              <h3 className="text-base font-bold text-[#1b2559] mb-4">审核状态分布</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart><Pie data={auditChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {auditChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie><RechartsTooltip /><Legend /></PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* 月度趋势 */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-[#1b2559] mb-4">月度趋势</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><RechartsTooltip /><Legend />
                  <Line type="monotone" dataKey="posts" name="帖子" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="comments" name="评论" stroke="#06b6d4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-[300px] flex items-center justify-center text-gray-400">暂无数据</div>}
          </Card>

          {/* 热度排行 */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-[#1b2559] mb-4">热度排行</h3>
            {hotPosts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hotPosts.slice(0, 10)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="title" tick={{ fontSize: 12 }} /><YAxis /><RechartsTooltip />
                  <Bar dataKey="viewCount" name="浏览量" fill="#8b5cf6" />
                  <Bar dataKey="likeCount" name="点赞数" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[300px] flex items-center justify-center text-gray-400">暂无数据</div>}
          </Card>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { RefreshCw, FileText, MessageCircle, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import * as forumApi from '../api/forum';
import type { ForumOverview } from '../types';

const COLORS = ['#4A8FA8', '#D49E42', '#2AAA8A', '#1E7A52', '#3A9B5B', '#C05638'];

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
      if (catRes.status === 'fulfilled' && catRes.value.code === 200 && catRes.value.data) {
        const d = catRes.value.data as any;
        setCategoryData(
          Array.isArray(d) ? d :
          (d.categories || []).map((c: any) => ({ name: c.categoryDesc || c.category, value: c.count }))
        );
      }
      if (auditRes.status === 'fulfilled' && auditRes.value.code === 200 && auditRes.value.data) setAuditData(auditRes.value.data);
      if (hotRes.status === 'fulfilled' && hotRes.value.code === 200 && hotRes.value.data) {
        const d = hotRes.value.data as any;
        setHotPosts(Array.isArray(d) ? d : (d.hotPosts || []));
      }
      if (monthRes.status === 'fulfilled' && monthRes.value.code === 200 && monthRes.value.data) {
        const d = monthRes.value.data as any;
        const raw = Array.isArray(d) ? d : (d.monthlyData || []);
        setMonthlyData(raw.map((m: any) => ({ month: m.month, posts: m.postCount ?? m.posts, comments: m.commentCount ?? m.comments })));
      }
    } catch (e) { console.error('获取统计数据失败:', e); }
    finally { setLoading(false); }
  };

  const auditChartData = [
    { name: '已通过', value: auditData.approved, color: '#3A9B5B' },
    { name: '待审核', value: auditData.pending, color: '#C8922A' },
    { name: '已拒绝', value: auditData.rejected, color: '#C05638' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-ink-600">论坛数据分析</h2>
        <button onClick={fetchAllData} disabled={loading} className="flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:border-bamboo-500 hover:text-bamboo-500 disabled:opacity-50 sm:w-auto sm:rounded">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 刷新数据
        </button>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">加载中...</div> : (
        <>
          {/* 概览卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: '总帖子数', value: overview.totalPosts, icon: FileText, color: '#4A8FA8' },
              { label: '已通过', value: overview.approvedPosts, icon: CheckCircle, color: '#3A9B5B' },
              { label: '待审核', value: overview.pendingPosts, icon: Clock, color: '#C8922A' },
              { label: '已拒绝', value: overview.rejectedPosts, icon: XCircle, color: '#C05638' },
              { label: '总评论数', value: overview.totalComments, icon: MessageCircle, color: '#2AAA8A' },
              { label: '活跃用户', value: overview.activeUsers, icon: Users, color: '#1E7A52' },
            ].map(({ label, value, icon: Icon, color }) => (
              <React.Fragment key={label}>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: color }}><Icon size={18} /></div>
                    <div>
                      <p className="text-2xl font-bold text-ink-600">{value}</p>
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
            <Card className="p-4 sm:p-6">
              <h3 className="text-base font-bold text-ink-600 mb-4">建议类型分布</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart><Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie><RechartsTooltip /><Legend /></PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[300px] flex items-center justify-center text-gray-400">暂无数据</div>}
            </Card>

            {/* 审核状态 */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-base font-bold text-ink-600 mb-4">审核状态分布</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart><Pie data={auditChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {auditChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie><RechartsTooltip /><Legend /></PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* 月度趋势 */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base font-bold text-ink-600 mb-4">月度趋势</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><RechartsTooltip /><Legend />
                  <Line type="monotone" dataKey="posts" name="帖子" stroke="#4A8FA8" strokeWidth={2} />
                  <Line type="monotone" dataKey="comments" name="评论" stroke="#2AAA8A" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-[300px] flex items-center justify-center text-gray-400">暂无数据</div>}
          </Card>

          {/* 热度排行 */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base font-bold text-ink-600 mb-4">热度排行</h3>
            {hotPosts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hotPosts.slice(0, 10)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="title" tick={{ fontSize: 12 }} /><YAxis /><RechartsTooltip />
                  <Bar dataKey="viewCount" name="浏览量" fill="#4A8FA8" />
                  <Bar dataKey="likeCount" name="点赞数" fill="#D49E42" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[300px] flex items-center justify-center text-gray-400">暂无数据</div>}
          </Card>
        </>
      )}
    </div>
  );
}

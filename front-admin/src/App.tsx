import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';

// 路由级 lazy 拆包：登录页保持同步加载，其余页面按需异步加载
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Attractions = lazy(() => import('./pages/Attractions'));
const ProductCategories = lazy(() => import('./pages/ProductCategories'));
const Products = lazy(() => import('./pages/Products'));
const Orders = lazy(() => import('./pages/Orders'));
const News = lazy(() => import('./pages/News'));
const ForumPosts = lazy(() => import('./pages/ForumPosts'));
const ForumComments = lazy(() => import('./pages/ForumComments'));
const ForumStatistics = lazy(() => import('./pages/ForumStatistics'));
const SystemConfig = lazy(() => import('./pages/SystemConfig'));
const SystemLogs = lazy(() => import('./pages/SystemLogs'));
const Person = lazy(() => import('./pages/Person'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const TourRoutes = lazy(() => import('./pages/TourRoutes'));
const Activities = lazy(() => import('./pages/Activities'));
const ActivityRegistrations = lazy(() => import('./pages/ActivityRegistrations'));
const TraceRecords = lazy(() => import('./pages/TraceRecords'));
const Reviews = lazy(() => import('./pages/Reviews'));

function PageFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: '#666',
      fontSize: 14,
    }}>
      <div style={{
        width: 28,
        height: 28,
        border: '3px solid #e5e7eb',
        borderTopColor: '#10b981',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginRight: 12,
      }} />
      页面加载中...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/attractions" element={<Attractions />} />
                    <Route path="/product-categories" element={<ProductCategories />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/forum-posts" element={<ForumPosts />} />
                    <Route path="/forum-comments" element={<ForumComments />} />
                    <Route path="/forum-statistics" element={<ForumStatistics />} />
                    <Route path="/system-config" element={<SystemConfig />} />
                    <Route path="/system-logs" element={<SystemLogs />} />
                    <Route path="/person" element={<Person />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/tour-routes" element={<TourRoutes />} />
                    <Route path="/activities-admin" element={<Activities />} />
                    <Route path="/activity-registrations" element={<ActivityRegistrations />} />
                    <Route path="/trace-records" element={<TraceRecords />} />
                    <Route path="/reviews" element={<Reviews />} />
                  </Routes>
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

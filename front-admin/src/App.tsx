import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Attractions from './pages/Attractions';
import ProductCategories from './pages/ProductCategories';
import Products from './pages/Products';
import Orders from './pages/Orders';
import News from './pages/News';
import ForumPosts from './pages/ForumPosts';
import ForumComments from './pages/ForumComments';
import ForumStatistics from './pages/ForumStatistics';
import SystemConfig from './pages/SystemConfig';
import SystemLogs from './pages/SystemLogs';
import Person from './pages/Person';
import ChangePassword from './pages/ChangePassword';
import TourRoutes from './pages/TourRoutes';
import Activities from './pages/Activities';
import ActivityRegistrations from './pages/ActivityRegistrations';
import TraceRecords from './pages/TraceRecords';

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
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

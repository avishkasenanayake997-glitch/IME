import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AppContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicLayout from '../components/layout/PublicLayout';
import { EmptyState, Spinner } from '../components/common/ui';

const Home = lazy(() => import('../pages/public/Home'));
const About = lazy(() => import('../pages/public/About'));
const Features = lazy(() => import('../pages/public/Features'));
const Pricing = lazy(() => import('../pages/public/Pricing'));
const Contact = lazy(() => import('../pages/public/Contact'));
const Login = lazy(() => import('../pages/auth/Login'));
const Forgot = lazy(() => import('../pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const POS = lazy(() => import('../pages/pos/POS'));
const Sales = lazy(() => import('../pages/sales/Sales'));
const Inventory = lazy(() => import('../pages/inventory/Inventory'));
const Customers = lazy(() => import('../pages/customers/Customers'));
const CustomerDetail = lazy(() => import('../pages/customers/CustomerDetail'));
const Employees = lazy(() => import('../pages/employees/Employees'));
const Reports = lazy(() => import('../pages/reports/Reports'));
const Insights = lazy(() => import('../pages/insights/Insights'));
const Branches = lazy(() => import('../pages/branches/Branches'));
const Notifications = lazy(() => import('../pages/notifications/Notifications'));
const SettingsPage = lazy(() => import('../pages/settings/Settings'));
const Profile = lazy(() => import('../pages/auth/Profile'));

function Protected({ children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}
function Guard({ module, children }) {
  const { canAccess } = useAuth();
  if (!canAccess(module)) return <EmptyState icon={ShieldAlert} title="Access restricted" message="Your role does not have permission to view this page. Contact your business owner if you need access." />;
  return children;
}
const G = (module, el) => <Guard module={module}>{el}</Guard>;

export default function AppRoutes() {
  const { user } = useAuth();
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/login" element={user ? <Navigate to="/app" replace /> : <Login />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/app" element={<Protected><DashboardLayout /></Protected>}>
          <Route index element={G('dashboard', <Dashboard />)} />
          <Route path="pos" element={G('pos', <POS />)} />
          <Route path="sales" element={G('sales', <Sales />)} />
          <Route path="inventory" element={G('inventory', <Inventory />)} />
          <Route path="customers" element={G('customers', <Customers />)} />
          <Route path="customers/:id" element={G('customers', <CustomerDetail />)} />
          <Route path="employees" element={G('employees', <Employees />)} />
          <Route path="reports" element={G('reports', <Reports />)} />
          <Route path="insights" element={G('insights', <Insights />)} />
          <Route path="branches" element={G('branches', <Branches />)} />
          <Route path="notifications" element={G('notifications', <Notifications />)} />
          <Route path="settings" element={G('settings', <SettingsPage />)} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

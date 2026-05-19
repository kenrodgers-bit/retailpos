import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { db } from './lib/db';
import { getSession, isAuthenticated, saveSession, clearSession } from './lib/session';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import SetupPage from './pages/Setup';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import SeedDemo from './pages/SeedDemo';
import POSPage from './pages/POS';
import ProductsPage from './pages/Products';
import ProductFormPage from './pages/ProductForm';
import ProductDetailsPage from './pages/ProductDetails';
import StockManagementPage from './pages/StockManagement';
import StockHistoryPage from './pages/StockHistory';
import SalesHistoryPage from './pages/SalesHistory';
import SaleDetailsPage from './pages/SaleDetails';
import ReceiptViewPage from './pages/ReceiptView';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import BackupRestorePage from './pages/BackupRestore';
import OfflineFallbackPage from './pages/OfflineFallback';

function App() {
  const [initialized, setInitialized] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [session, setSession] = useState(getSession());
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdmin() {
      const adminCount = await db.admin.count();
      setHasAdmin(adminCount > 0);
      setInitialized(true);
    }
    checkAdmin();
  }, []);

  const auth = useMemo(
    () => ({
      signedIn: Boolean(session),
      login(adminId: number) {
        saveSession(adminId);
        setSession(getSession());
      },
      logout() {
        clearSession();
        setSession(null);
        navigate('/login');
      }
    }),
    [navigate, session]
  );

  if (!initialized) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/seed" element={<SeedDemo />} />
      <Route path="/offline" element={<OfflineFallbackPage />} />
      <Route path="/setup" element={<SetupPage onSetup={() => navigate('/login')} />} />
      <Route path="/login" element={<LoginPage onLogin={(adminId) => auth.login(adminId)} hasAdmin={hasAdmin} />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/new" element={<ProductFormPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/products/:id/edit" element={<ProductFormPage />} />
                <Route path="/stock" element={<StockManagementPage />} />
                <Route path="/stock/history" element={<StockHistoryPage />} />
                <Route path="/sales" element={<SalesHistoryPage />} />
                <Route path="/sales/:id" element={<SaleDetailsPage />} />
                <Route path="/receipt/:id" element={<ReceiptViewPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage onLogout={() => auth.logout()} />} />
                <Route path="/backup" element={<BackupRestorePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

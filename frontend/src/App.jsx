import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import LoginPage from './routes/LoginPage.jsx';
import RegisterPage from './routes/RegisterPage.jsx';
import DashboardPage from './routes/DashboardPage.jsx';
import Layout from './components/Layout.jsx';

function ProtectedRoute({ children }) {
  const { token, user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <p className="font-mono text-sm text-slate-500">loading session…</p>
      </div>
    );
  }
  if (!token || !user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { token, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={token && user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={token && user ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

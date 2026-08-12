import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header.jsx';
import Home from './pages/Home';
import Verify from './pages/Verify';
import IssuerDashboard from './pages/IssuerDashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/login" element={<Login />} />

            {/* Issuer Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <IssuerDashboard />
              </ProtectedRoute>
            } />

            {/* Admin Only Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* Redirect any unknown route to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="py-10 text-center text-slate-500 text-sm border-t border-white/5 mt-20">
          <div className="flex justify-center items-center gap-2 mb-2 font-bold">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            TrustChain Network Nodes Active
          </div>
          © 2026 TrustChain Verification Ecosystem. Secured by Polygon & AI Forensics.
        </footer>
      </div>
    </Router>
  );
}

export default App; 

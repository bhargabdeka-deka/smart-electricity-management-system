import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

// 🌐 User Pages
import HomePage from './pages/HomePage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import WelcomePage from './pages/WelcomePage';
import EnergyTrackerPage from './pages/EnergyTrackerPage';
import KycBillDashboard from './pages/KycBillPortal/KycBillDashboard';
import HelpdeskPage from './pages/HelpdeskPortal/HelpdeskPage';

// 🛠️ Admin Panel Pages
import AdminDashboard from './pages/AdminPanel/AdminDashboard';
import ConnectionRequests from './pages/AdminPanel/ConnectionRequests';
import HelpdeskTickets from './pages/AdminPanel/HelpdeskTicketsPage';
import KycReviewPanel from './pages/AdminPanel/KycReviewPanel';

// 👑 Super Admin Panel Pages
import SuperAdminPanel from './pages/SuperPanel/SuperAdminPanel';
import PromoteUser from './pages/SuperPanel/PromoteUser';

// 🧭 Global Navigation
import UserNavbar from './components/UserNavbar';
import AdminNavbar from './components/AdminNavbar';
import SuperNavbar from './components/SuperNavbar';
import EngineerNavbar from './components/EngineerNavbar';
import ConnectionStepper from './pages/ConnectionPortal/ConnectionStepper';

// 🔧 Engineer Panel Pages
import EngineerDashboard from './pages/EngineerPanel/EngineerDashboard';
import EngineerJobs from './pages/EngineerPanel/EngineerJobs';

// ℹ️ Informational Pages
import { About, Contact, Privacy, Terms, Accessibility } from './pages/InfoPages';

function AppWrapper() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setSessionLoaded(true);
  }, [location.pathname]);

  if (!sessionLoaded) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        ⏳ Loading session...
      </div>
    );
  }

  const isPublicPage = ['/', '/login', '/signup'].includes(location.pathname);
  const showNavbar = user?.token && !isPublicPage;

  return (
    <>
      {/* Role-based Navbar */}
      {showNavbar && user.role === 'user' && <UserNavbar />}
      {showNavbar && ['admin', 'superadmin'].includes(user.role) && (
        user.role === 'admin' ? <AdminNavbar /> : <SuperNavbar />
      )}
      {showNavbar && user.role === 'engineer' && <EngineerNavbar />}

      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/accessibility" element={<Accessibility />} />

        {/* User-only Pages */}
        <Route
          path="/homepage"
          element={
            user?.token && user.role === 'user' ? (
              <HomePage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/apply"
          element={
            user?.token && user.role === 'user' ? (
              <ConnectionStepper />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/tracker"
          element={
            user?.token && user.role === 'user' ? (
              <EnergyTrackerPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Helpdesk for regular users */}
        <Route
          path="/helpdesk"
          element={
            user?.token && user.role === 'user' ? (
              <HelpdeskPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Bill & KYC Portal */}
        <Route
          path="/kyc-bill"
          element={
            user?.token && user.role === 'user' ? (
              <KycBillDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            user?.token && ['admin', 'superadmin'].includes(user.role) ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/connections"
          element={
            user?.token && ['admin', 'superadmin'].includes(user.role) ? (
              <ConnectionRequests />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/helpdesk"
          element={
            user?.token && ['admin', 'superadmin'].includes(user.role) ? (
              <HelpdeskTickets />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/kyc-review"
          element={
            user?.token && ['admin', 'superadmin'].includes(user.role) ? (
              <KycReviewPanel />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Superadmin Routes */}
        <Route
          path="/superadmin"
          element={
            user?.token && user.role === 'superadmin' ? (
              <SuperAdminPanel />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/superadmin/promote"
          element={
            user?.token && user.role === 'superadmin' ? (
              <PromoteUser />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 🔧 Engineer Routes */}
        <Route
          path="/engineer"
          element={
            user?.token && user.role === 'engineer' ? (
              <EngineerDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/engineer/jobs"
          element={
            user?.token && user.role === 'engineer' ? (
              <EngineerJobs />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Fallback for any unknown path */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
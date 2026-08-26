import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';

import MemberDashboard from './pages/member/MemberDashboard.jsx';
import CheckIn from './pages/member/CheckIn.jsx';
import MyActivity from './pages/member/MyActivity.jsx';
import MyProfile from './pages/member/MyProfile.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import Members from './pages/admin/Members.jsx';
import MemberDetails from './pages/admin/MemberDetails.jsx';
import Events from './pages/admin/Events.jsx';
import EventDetails from './pages/admin/EventDetails.jsx';
import Contributions from './pages/admin/Contributions.jsx';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route path="/member/dashboard" element={<ProtectedRoute role="MEMBER"><MemberDashboard /></ProtectedRoute>} />
      <Route path="/member/check-in" element={<ProtectedRoute role="MEMBER"><CheckIn /></ProtectedRoute>} />
      <Route path="/member/activity" element={<ProtectedRoute role="MEMBER"><MyActivity /></ProtectedRoute>} />
      <Route path="/member/profile" element={<ProtectedRoute role="MEMBER"><MyProfile /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/members" element={<ProtectedRoute role="ADMIN"><Members /></ProtectedRoute>} />
      <Route path="/admin/members/:id" element={<ProtectedRoute role="ADMIN"><MemberDetails /></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute role="ADMIN"><Events /></ProtectedRoute>} />
      <Route path="/admin/events/:id" element={<ProtectedRoute role="ADMIN"><EventDetails /></ProtectedRoute>} />
      <Route path="/admin/contributions" element={<ProtectedRoute role="ADMIN"><Contributions /></ProtectedRoute>} />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

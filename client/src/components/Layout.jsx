import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const memberLinks = [
  { to: '/member/dashboard', label: 'Dashboard' },
  { to: '/member/check-in', label: 'Check In' },
  { to: '/member/activity', label: 'My Activity' },
  { to: '/member/profile', label: 'My Profile' },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/members', label: 'Members' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/contributions', label: 'Contributions' },
];

export default function Layout({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'ADMIN' ? adminLinks : memberLinks;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Society Tracker</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          {user?.name}
          <br />
          <span style={{ opacity: 0.7 }}>{user?.role}</span>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <h1>{title}</h1>
          <div className="topbar-user">
            <span>{user?.email}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleLinkClick() {
    setSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">Society Tracker</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={handleLinkClick}
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
          <div className="topbar-left">
            <button
              className="hamburger-btn"
              aria-label="Toggle menu"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              ☰
            </button>
            <h1>{title}</h1>
          </div>
          <div className="topbar-user">
            <span className="topbar-email">{user?.email}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
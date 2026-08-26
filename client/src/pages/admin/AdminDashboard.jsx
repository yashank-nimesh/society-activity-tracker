import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../../components/Layout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../services/api.js';

const COLORS = { ACTIVE: '#16a34a', 'LOW ACTIVITY': '#d97706', INACTIVE: '#dc2626' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((res) => setData(res.data.data));
  }, []);

  if (!data) return <Layout title="Admin Dashboard"><p className="loading-text">Loading...</p></Layout>;

  const { summaryCards, statusDistribution, topMembers, mostConsistent, recentEvents, recentAttendance, recentContributions } = data;

  return (
    <Layout title="Admin Dashboard">
      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-label">Total Members</div>
          <div className="stat-value">{summaryCards.totalMembers}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{summaryCards.activeMembers}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Low Activity</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{summaryCards.lowActivity}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Inactive</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{summaryCards.inactiveMembers}</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Activity Status Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusDistribution} dataKey="count" nameKey="status" outerRadius={80} label>
                {statusDistribution.map((entry) => (
                  <Cell key={entry.status} fill={COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Top Members by Activity Score</div>
          <table>
            <thead><tr><th>Name</th><th>Score</th><th>Status</th></tr></thead>
            <tbody>
              {topMembers.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.totalActivityScore}</td>
                  <td><StatusBadge status={m.activityStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Recent Events</div>
          <table>
            <tbody>
              {recentEvents.map((e) => (
                <tr key={e._id}><td>{e.title}</td><td>{new Date(e.date).toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Recent Attendance</div>
          <table>
            <tbody>
              {recentAttendance.map((a) => (
                <tr key={a._id}><td>{a.member?.name}</td><td>{a.event?.title}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Recent Contributions</div>
          <table>
            <tbody>
              {recentContributions.map((c) => (
                <tr key={c._id}><td>{c.member?.name}</td><td>{c.title}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-title">Most Consistent Members (Attendance %)</div>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Attendance %</th></tr></thead>
          <tbody>
            {mostConsistent.map((m) => (
              <tr key={m.id}><td>{m.name}</td><td>{m.attendancePercentage}%</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [activityRes, attendanceRes, eventsRes, contribRes] = await Promise.all([
        api.get('/members/me/activity'),
        api.get('/attendance/my'),
        api.get('/events'),
        api.get(`/contributions/member/${user.id}`),
      ]);
      setActivity(activityRes.data.data);
      setAttendance(attendanceRes.data.data);
      setContributions(contribRes.data.data);
      setEvents(eventsRes.data.data);
      setLoading(false);
    }
    load();
  }, [user.id]);

  if (loading) return <Layout title="Dashboard"><p className="loading-text">Loading...</p></Layout>;

  const totalScore = activity?.totalActivityScore ?? 0;
  const attendancePercentage = activity?.attendancePercentage ?? 0;

  return (
    <Layout title="My Dashboard">
      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-label">My Activity Score</div>
          <div className="stat-value">{totalScore}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Attendance %</div>
          <div className="stat-value">{attendancePercentage}%</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Contribution Count</div>
          <div className="stat-value">{contributions.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ fontSize: 16, marginTop: 6 }}>
            <StatusBadge status={activity?.activityStatus || 'ACTIVE'} />
          </div>
        </div>
      </div>

      <div className="section-title">Recent Attendance</div>
      <div className="card">
        <table>
          <thead><tr><th>Event</th><th>Type</th><th>Points</th><th>Checked In</th></tr></thead>
          <tbody>
            {attendance.slice(0, 5).map((a) => (
              <tr key={a._id}>
                <td>{a.event?.title}</td>
                <td>{a.event?.type}</td>
                <td>{a.attendancePoints}</td>
                <td>{new Date(a.checkedInAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {attendance.length === 0 && <tr><td colSpan={4}>No attendance yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="section-title">Recent Contributions</div>
      <div className="card">
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Points</th><th>Date</th></tr></thead>
          <tbody>
            {contributions.slice(0, 5).map((c) => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{c.points}</td>
                <td>{new Date(c.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {contributions.length === 0 && <tr><td colSpan={4}>No contributions logged yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="section-title">Upcoming / Recent Events</div>
      <div className="card">
        <table>
          <thead><tr><th>Title</th><th>Type</th><th>Date</th></tr></thead>
          <tbody>
            {events.slice(0, 5).map((e) => (
              <tr key={e._id}><td>{e.title}</td><td>{e.type}</td><td>{new Date(e.date).toLocaleDateString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

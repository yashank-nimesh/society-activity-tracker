import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MyActivity() {
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [activityRes, attendanceRes, contribRes] = await Promise.all([
        api.get('/members/me/activity'),
        api.get('/attendance/my'),
        api.get(`/contributions/member/${user.id}`),
      ]);
      setActivity(activityRes.data.data);
      setAttendance(attendanceRes.data.data);
      setContributions(contribRes.data.data);
      setLoading(false);
    }
    load();
  }, [user.id]);

  if (loading) return <Layout title="My Activity"><p className="loading-text">Loading...</p></Layout>;

  // Merge attendance + contributions into one timeline, sorted recent first.
  const timeline = [
    ...attendance.map((a) => ({
      kind: 'Attendance',
      label: a.event?.title,
      points: a.attendancePoints,
      date: a.checkedInAt,
    })),
    ...contributions.map((c) => ({
      kind: 'Contribution',
      label: c.title,
      points: c.points,
      date: c.date,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Layout title="My Activity">
      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-label">Meetings Attended</div>
          <div className="stat-value">{activity.meetingsAttended}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Meetings Missed</div>
          <div className="stat-value">{activity.meetingsMissed}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Contribution Points</div>
          <div className="stat-value">{activity.contributionPoints}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Activity Score</div>
          <div className="stat-value">{activity.totalActivityScore}</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        Current status: <StatusBadge status={activity.activityStatus} />
      </div>

      <div className="section-title">Activity Timeline</div>
      <div className="card">
        <table>
          <thead><tr><th>Type</th><th>Item</th><th>Points</th><th>Date</th></tr></thead>
          <tbody>
            {timeline.map((t, i) => (
              <tr key={i}>
                <td>{t.kind}</td>
                <td>{t.label}</td>
                <td>+{t.points}</td>
                <td>{new Date(t.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {timeline.length === 0 && <tr><td colSpan={4}>No activity yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

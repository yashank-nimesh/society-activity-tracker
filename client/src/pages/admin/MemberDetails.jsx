import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../services/api.js';

export default function MemberDetails() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [contributions, setContributions] = useState([]);

  async function load() {
    const [memberRes, contribRes] = await Promise.all([
      api.get(`/members/${id}`),
      api.get(`/contributions/member/${id}`),
    ]);
    setMember(memberRes.data.data);
    setContributions(contribRes.data.data);
  }

  useEffect(() => { load(); }, [id]);

  async function toggleActive() {
    await api.patch(`/members/${id}/status`, { isActive: !member.isActive });
    load();
  }

  if (!member) return <Layout title="Member Details"><p className="loading-text">Loading...</p></Layout>;

  const { activity } = member;

  return (
    <Layout title="Member Details">
      <div className="grid grid-2">
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Profile</div>
          <table>
            <tbody>
              <tr><th>Name</th><td>{member.name}</td></tr>
              <tr><th>Email</th><td>{member.email}</td></tr>
              <tr><th>Department</th><td>{member.department}</td></tr>
              <tr><th>Position</th><td>{member.position}</td></tr>
              <tr><th>Joined</th><td>{new Date(member.joiningDate).toLocaleDateString()}</td></tr>
              <tr><th>Account</th><td>{member.isActive ? 'Active' : 'Deactivated'}</td></tr>
            </tbody>
          </table>
          <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={toggleActive}>
            {member.isActive ? 'Deactivate Account' : 'Activate Account'}
          </button>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>Activity Summary</div>
          <table>
            <tbody>
              <tr><th>Attendance %</th><td>{activity.attendancePercentage}%</td></tr>
              <tr><th>Contribution Count</th><td>{activity.contributionCount}</td></tr>
              <tr><th>Attendance Points</th><td>{activity.attendancePoints}</td></tr>
              <tr><th>Contribution Points</th><td>{activity.contributionPoints}</td></tr>
              <tr><th>Activity Score</th><td><b>{activity.totalActivityScore}</b></td></tr>
              <tr><th>Status</th><td><StatusBadge status={activity.activityStatus} /></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-title">Contributions</div>
      <div className="card">
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Points</th><th>Date</th></tr></thead>
          <tbody>
            {contributions.map((c) => (
              <tr key={c._id}>
                <td>{c.title}</td><td>{c.category}</td><td>{c.points}</td>
                <td>{new Date(c.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {contributions.length === 0 && <tr><td colSpan={4}>No contributions logged.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

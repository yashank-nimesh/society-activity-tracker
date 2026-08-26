import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MyProfile() {
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    api.get('/members/me/activity').then((res) => setActivity(res.data.data));
  }, []);

  return (
    <Layout title="My Profile">
      <div className="card" style={{ maxWidth: 480 }}>
        <table>
          <tbody>
            <tr><th>Name</th><td>{user.name}</td></tr>
            <tr><th>Email</th><td>{user.email}</td></tr>
            <tr><th>Department</th><td>{user.department || '-'}</td></tr>
            <tr><th>Position</th><td>{user.position || '-'}</td></tr>
            {activity && (
              <>
                <tr><th>Attendance %</th><td>{activity.attendancePercentage}%</td></tr>
                <tr><th>Contribution Count</th><td>{activity.contributionCount}</td></tr>
                <tr><th>Activity Score</th><td>{activity.totalActivityScore}</td></tr>
                <tr><th>Status</th><td><StatusBadge status={activity.activityStatus} /></td></tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

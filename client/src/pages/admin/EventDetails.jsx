import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import api from '../../services/api.js';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    api.get(`/events/${id}`).then((res) => setEvent(res.data.data));
    api.get(`/attendance/event/${id}`).then((res) => setAttendance(res.data.data));
  }, [id]);

  if (!event) return <Layout title="Event Details"><p className="loading-text">Loading...</p></Layout>;

  return (
    <Layout title="Event Details">
      <div className="card" style={{ maxWidth: 520 }}>
        <table>
          <tbody>
            <tr><th>Title</th><td>{event.title}</td></tr>
            <tr><th>Type</th><td>{event.type}</td></tr>
            <tr><th>Date</th><td>{new Date(event.date).toLocaleDateString()}</td></tr>
            <tr><th>Start Time</th><td>{event.startTime}</td></tr>
            <tr><th>Check-in Code</th><td><code>{event.checkInCode}</code></td></tr>
            <tr><th>Check-in Window</th><td>{new Date(event.checkInStart).toLocaleString()} — {new Date(event.checkInEnd).toLocaleString()}</td></tr>
            <tr><th>Created By</th><td>{event.createdBy?.name}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="section-title">Attendance ({attendance.length})</div>
      <div className="card">
        <table>
          <thead><tr><th>Member</th><th>Email</th><th>Checked In</th></tr></thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a._id}>
                <td>{a.member?.name}</td>
                <td>{a.member?.email}</td>
                <td>{new Date(a.checkedInAt).toLocaleString()}</td>
              </tr>
            ))}
            {attendance.length === 0 && <tr><td colSpan={3}>No one has checked in yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

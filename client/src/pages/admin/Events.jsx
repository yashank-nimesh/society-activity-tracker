import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import api from '../../services/api.js';

const EVENT_TYPES = ['Weekly Meeting', 'Orientation', 'Workshop', 'Project Meeting', 'Event'];

function toLocalInput(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', date: '', startTime: '10:00', type: 'Weekly Meeting',
    checkInStart: '', checkInEnd: '',
  });

  async function load() {
    const res = await api.get('/events');
    setEvents(res.data.data);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/events', form);
      setShowModal(false);
      setForm({ title: '', date: '', startTime: '10:00', type: 'Weekly Meeting', checkInStart: '', checkInEnd: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    }
  }

  return (
    <Layout title="Events">
      <div className="filters-row">
        <button className="btn" onClick={() => setShowModal(true)}>+ Create Event</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Title</th><th>Type</th><th>Date</th><th>Check-in Code</th><th></th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e._id}>
                <td>{e.title}</td>
                <td>{e.type}</td>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td><code>{e.checkInCode}</code></td>
                <td><Link className="btn btn-secondary" to={`/admin/events/${e._id}`}>View</Link></td>
              </tr>
            ))}
            {events.length === 0 && <tr><td colSpan={5}>No events yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Create Event</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Check-in Opens</label>
                <input type="datetime-local" required value={form.checkInStart} onChange={(e) => setForm({ ...form, checkInStart: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Check-in Closes</label>
                <input type="datetime-local" required value={form.checkInEnd} onChange={(e) => setForm({ ...form, checkInEnd: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

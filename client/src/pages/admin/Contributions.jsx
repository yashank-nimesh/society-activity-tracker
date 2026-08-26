import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import api from '../../services/api.js';

const CATEGORIES = ['Technical', 'Design', 'Content', 'Management', 'Outreach', 'Event Operations'];

export default function Contributions() {
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    member: '', title: '', description: '', category: 'Technical',
    contributionType: 'MINOR', date: '',
  });

  async function load() {
    const [contribRes, membersRes] = await Promise.all([
      api.get('/contributions'),
      api.get('/members'),
    ]);
    setContributions(contribRes.data.data);
    setMembers(membersRes.data.data);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/contributions', form);
      setShowModal(false);
      setForm({ member: '', title: '', description: '', category: 'Technical', contributionType: 'MINOR', date: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log contribution.');
    }
  }

  return (
    <Layout title="Contributions">
      <div className="filters-row">
        <button className="btn" onClick={() => setShowModal(true)}>+ Log Contribution</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Member</th><th>Title</th><th>Category</th><th>Points</th><th>Logged By</th><th>Date</th></tr></thead>
          <tbody>
            {contributions.map((c) => (
              <tr key={c._id}>
                <td>{c.member?.name}</td>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{c.points}</td>
                <td>{c.loggedBy?.name}</td>
                <td>{new Date(c.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {contributions.length === 0 && <tr><td colSpan={6}>No contributions logged yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Log Contribution</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Member</label>
                <select required value={form.member} onChange={(e) => setForm({ ...form, member: e.target.value })}>
                  <option value="">Select a member</option>
                  {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Contribution Type</label>
                <select value={form.contributionType} onChange={(e) => setForm({ ...form, contributionType: e.target.value })}>
                  <option value="MINOR">Minor (5 points)</option>
                  <option value="MAJOR">Major (15 points)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn">Log Contribution</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

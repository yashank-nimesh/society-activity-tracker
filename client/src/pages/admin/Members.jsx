import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import api from '../../services/api.js';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', position: '', role: 'MEMBER' });
  const [error, setError] = useState('');

  async function load() {
    const params = {};
    if (search) params.search = search;
    if (department) params.department = department;
    if (status) params.status = status;
    const res = await api.get('/members', { params });
    setMembers(res.data.data);
  }

  useEffect(() => { load(); }, [search, department, status]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/members', form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', department: '', position: '', role: 'MEMBER' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create member.');
    }
  }

  return (
    <Layout title="Members">
      <div className="filters-row">
        <input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All Departments</option>
          <option>Technical</option>
          <option>Design</option>
          <option>Content</option>
          <option>Management</option>
          <option>Outreach</option>
          <option>Event Operations</option>
          <option>Core Committee</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active Account</option>
          <option value="inactive">Inactive Account</option>
        </select>
        <button className="btn" onClick={() => setShowModal(true)}>+ Add Member</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Position</th><th>Account</th><th></th></tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.department}</td>
                <td>{m.position}</td>
                <td>{m.isActive ? 'Active' : 'Deactivated'}</td>
                <td><Link className="btn btn-secondary" to={`/admin/members/${m._id}`}>View</Link></td>
              </tr>
            ))}
            {members.length === 0 && <tr><td colSpan={6}>No members found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Add Member</h2>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
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

import React, { useState } from 'react';
import Layout from '../../components/Layout.jsx';
import api from '../../services/api.js';

export default function CheckIn() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/attendance/check-in', { code });
      setMessage('Checked in successfully! Points awarded: ' + res.data.data.attendancePoints);
      setCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Check In">
      <div className="card" style={{ maxWidth: 420 }}>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 0 }}>
          Enter the check-in code announced at the event or meeting.
        </p>
        {message && <div className="success-banner">{message}</div>}
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Check-in Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3"
              required
            />
          </div>
          <button className="btn" disabled={loading}>{loading ? 'Checking in...' : 'Check In'}</button>
        </form>
      </div>
    </Layout>
  );
}

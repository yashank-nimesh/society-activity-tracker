import React from 'react';

export default function StatusBadge({ status }) {
  const map = {
    ACTIVE: 'badge-active',
    'LOW ACTIVITY': 'badge-low',
    INACTIVE: 'badge-inactive',
  };
  return <span className={`badge ${map[status] || ''}`}>{status}</span>;
}

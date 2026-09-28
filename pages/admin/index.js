import { useEffect, useState } from 'react';
import Head from 'next/head';
import CreateUserForm from '../../components/admin/CreateUserForm';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch metrics from the admin dashboard API
  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();

        if (res.ok) {
          setStats(data);
        } else {
          setError(data.error || 'Failed to load dashboard data.');
        }
      } catch (err) {
        setError('Network error: Unable to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  return (
    <>
      <Head>
        <title>Admin Dashboard | E-Voting Platform</title>
      </Head>

      <main style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ marginBottom: '8px' }}>Admin Control Center</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Manage elections, staff account creation, and monitor system activity.
        </p>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Dashboard Metrics Overview */}
        {loading ? (
          <p>Loading system statistics...</p>
        ) : stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={cardStyle}>
              <h4 style={cardLabelStyle}>Total Elections</h4>
              <p style={cardValueStyle}>{stats.elections.total}</p>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                {stats.elections.open} Open | {stats.elections.closed} Closed
              </span>
            </div>

            <div style={cardStyle}>
              <h4 style={cardLabelStyle}>Voters Registered</h4>
              <p style={cardValueStyle}>{stats.voters.total}</p>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                {stats.voters.approved} Approved | {stats.voters.pending} Pending
              </span>
            </div>

            <div style={cardStyle}>
              <h4 style={cardLabelStyle}>Staff Accounts</h4>
              <p style={cardValueStyle}>{stats.staff}</p>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>Admins, Officials & Observers</span>
            </div>
          </div>
        ) : null}

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '40px 0' }} />

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', alignItems: 'start' }}>
          
          {/* Create User Section */}
          <section>
            <CreateUserForm />
          </section>

          {/* Recent Activity Log */}
          <section style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Recent Audit Activity</h3>
            {stats?.recentActivity?.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stats.recentActivity.map((log) => (
                  <li key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }}>
                    <strong>{log.actor}</strong> ({log.role}) — <span style={{ textTransform: 'capitalize' }}>{log.action.replace('_', ' ')}</span>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#888', fontSize: '0.9rem' }}>No recent activity recorded.</p>
            )}
          </section>

        </div>
      </main>
    </>
  );
}

// Inline Styles for Stat Cards
const cardStyle = {
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  backgroundColor: '#fafafa',
};

const cardLabelStyle = {
  margin: '0 0 8px 0',
  color: '#555',
  fontSize: '0.9rem',
  fontWeight: 'normal',
};

const cardValueStyle = {
  margin: '0 0 4px 0',
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#111',
};

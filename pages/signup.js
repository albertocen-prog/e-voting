import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function StaffSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ELECTION_OFFICIAL',
    secretKey: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login?signup=success');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Staff Signup | E-Voting Platform</title>
      </Head>
      <div style={containerStyle}>
        <h2>Staff Account Registration</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>Sign up as an official or observer with your authorization key.</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
              <option value="ELECTION_OFFICIAL">Election Official</option>
              <option value="OBSERVER">Election Observer</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div style={inputGroupStyle}>
            <label>Role Authorization Key</label>
            <input type="password" name="secretKey" value={formData.secretKey} onChange={handleChange} required style={inputStyle} placeholder="Enter provided security key" />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Processing...' : 'Create Staff Account'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          Back to <Link href="/login">Login</Link>
        </p>
      </div>
    </>
  );
}

const containerStyle = { maxWidth: '450px', margin: '50px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' };
const inputGroupStyle = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const errorStyle = { padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px' };

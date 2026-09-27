import { useState } from 'react';
import { useRouter } from 'next/router';

export default function StaffSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ELECTION_OFFICIAL',
    secretKey: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Staff & Observer Registration</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="ADMIN">System Administrator</option>
            <option value="ELECTION_OFFICIAL">Election Official</option>
            <option value="OBSERVER">Election Observer</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Role Authorization Key</label>
          <input type="password" name="secretKey" value={formData.secretKey} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} placeholder="Enter assigned key" />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Register Account
        </button>
      </form>
    </div>
  );
}

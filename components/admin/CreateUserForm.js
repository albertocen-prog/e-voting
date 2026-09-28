import { useState } from 'react';

export default function CreateUserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ELECTION_OFFICIAL',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully created ${formData.role} account for ${data.user.name}!` });
        setFormData({ name: '', email: '', password: '', role: 'ELECTION_OFFICIAL' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create account' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff' }}>
      <h3>Create Official or Observer Account</h3>

      {message.text && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', color: '#fff', backgroundColor: message.type === 'success' ? '#2e7d32' : '#d32f2f' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Temporary Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Role</label>
          <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="ELECTION_OFFICIAL">Election Official</option>
            <option value="OBSERVER">Election Observer</option>
            <option value="ADMIN">System Administrator</option>
          </select>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

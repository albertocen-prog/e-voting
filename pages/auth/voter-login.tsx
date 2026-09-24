import { useState } from 'react';
import { useRouter } from 'next/router';

export default function VoterLogin() {
  const [voterId, setVoterId] = useState('');
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/voter-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId }),
    });

    if (res.ok) {
      router.push('/');
    } else {
      const body = await res.json();
      alert(body?.error || 'Login failed');
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Voter Login</h1>
      <form onSubmit={submit}>
        <label>
          Voter ID:{' '}
          <input
            type="text"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value)}
          />
        </label>
        <button type="submit" style={{ marginLeft: '0.5rem' }}>
          Login
        </button>
      </form>
    </main>
  );
}

/**import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';

export default function VoterLogin() {
  const [voterId, setVoterId] = useState('');
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/voter-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId }),
    });
    
    if (res.ok) {
      router.push('/');
    } else {
      const body = await res.json();
      alert(body?.error || 'Login failed');
    }
  };

  return (
    <main>
      <h1>Voter Login</h1>
      <form onSubmit={submit}>
        <label>
          Voter ID
          <input value={voterId} onChange={(e) => setVoterId(e.target.value)} />
        </label>
        <button type="submit">Login</button>
      </form>
    </main>
  );**/
}

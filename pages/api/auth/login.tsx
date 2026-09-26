import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';

export default function VoterLoginPage() {
  const router = useRouter();
  const [voterId, setVoterId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/voter-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      router.push('/voter/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h1>Voter Login</h1>
      <form onSubmit={submit}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="voterId" style={{ display: 'block', marginBottom: '8px' }}>
            Voter ID
          </label>
          <input
            id="voterId"
            type="text"
            value={voterId}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setVoterId(e.target.value)}
            placeholder="Enter your Voter ID"
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

import { useState } from 'react'
import { useRouter } from 'next/router'

export default function VoterLogin() {
  const [voterId, setVoterId] = useState('')
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth/voter-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId }),
    })
    if (res.ok) router.push('/')
    else {
      const body = await res.json()
      alert(body?.error || 'Login failed')
    }
  }

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
  )
}

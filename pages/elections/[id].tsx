import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type BallotSummary = {
  id: string;
  title: string;
}

type ElectionDetail = {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  status: string;
  ballots?: BallotSummary[];
}

export default function ElectionDetailPage() {
  const router = useRouter()
  const { id } = router.query

  const [election, setElection] = useState<ElectionDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Wait until router.query is ready
    if (!router.isReady) return
    if (!id || typeof id !== 'string') {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchElection() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/elections/${id}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to load election (Status: ${response.status})`)
        }

        const data: ElectionDetail = await response.json()
        setElection(data)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error(err)
          setError(err.message || 'An unexpected error occurred')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchElection()

    return () => controller.abort()
  }, [id, router.isReady])

  if (loading) return <div>Loading election details...</div>
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>
  if (!election) return <div>Election not found</div>

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{election.title}</h1>
      {election.description && <p>{election.description}</p>}
      <p>
        {new Date(election.startAt).toLocaleString()} →{' '}
        {new Date(election.endAt).toLocaleString()} ({election.status})
      </p>

      <h2>Ballots</h2>
      {election.ballots && election.ballots.length > 0 ? (
        <ul>
          {election.ballots.map((b) => (
            <li key={b.id}>
              <Link href={`/ballots/${b.id}`}>{b.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No ballots available for this election.</p>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <Link href="/auth/voter-login">Voter Login to cast vote</Link>
      </div>
    </main>
  )
}

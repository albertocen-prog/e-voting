import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type ElectionDetail = {
  id: string
  title: string
  description?: string
  startAt: string
  endAt: string
  status: string
  ballots?: { id: string; title: string }[]
}

export default function ElectionDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [election, setElection] = useState<ElectionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/elections/${id}`)
      .then((r) => r.json())
      .then((data) => setElection(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!election) return <div>Election not found</div>

  return (
    <main>
      <h1>{election.title}</h1>
      <p>{election.description}</p>
      <p>
        {election.startAt} → {election.endAt} ({election.status})
      </p>

      <h2>Ballots</h2>
      <ul>
        {(election.ballots || []).map((b) => (
          <li key={b.id}>
            <Link href={`/ballots/${b.id}`}>{b.title}</Link>
          </li>
        ))}
      </ul>

      <div>
        <Link href={`/auth/voter-login`}>Voter Login to cast vote</Link>
      </div>
    </main>
  )
}

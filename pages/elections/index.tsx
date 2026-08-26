import Link from 'next/link'
import { useEffect, useState } from 'react'

type Election = {
  id: string
  title: string
  description?: string
  status: string
  startAt: string
  endAt: string
}

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/elections')
      .then((r) => r.json())
      .then((data) => {
        setElections(data.elections || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <main>
      <h1>Elections</h1>
      <ul>
        {elections.map((e) => (
          <li key={e.id}>
            <Link href={`/elections/${e.id}`}>{e.title}</Link> — {e.status}
            <p>{e.description}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/elections')
      .then((res) => res.json())
      .then((data) => setElections(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading elections...</div>;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Elections</h1>
      <ul>
        {elections.map((election) => (
          <li key={election.id}>
            <Link href={`/elections/${election.id}`}>{election.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

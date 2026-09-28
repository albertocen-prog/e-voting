import Head from 'next/head'
import Link from 'next/link'

export default function FeaturesPage() {
  return (
    <>
      <Head>
        <title>Key Features | Student Voting Platform</title>
        <meta name="description" content="Explore key features of our secure electronic voting platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        {/* Navigation Bar */}
        <nav className="navbar" style={navStyle}>
          <div className="nav-container" style={navContainerStyle}>
            <div className="nav-brand">
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>🗳️ Student Voting Platform</h2>
            </div>
            <div>
              <Link href="/" style={backLinkStyle}>&larr; Back to Home</Link>
            </div>
          </div>
        </nav>

        {/* Features Content */}
        <main className="main-content" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
          <section className="features-section">
            <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Key Features</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
              Comprehensive tools designed for secure, transparent, and streamlined elections.
            </p>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔑</div>
                <h3>Secure Authentication</h3>
                <p>Multiple authentication methods including voter ID login and email+password for officials with role-based access control.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🗳️</div>
                <h3>Election Management</h3>
                <p>Create, configure, and manage elections with full lifecycle control from draft to closed status.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3>Ballot Configuration</h3>
                <p>Flexible ballot creation with multiple options and candidate management per election.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">✅</div>
                <h3>One Vote Per Voter</h3>
                <p>Database-level constraints ensure each voter can only vote once per election.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Results &amp; Reporting</h3>
                <p>Real-time results dashboard with CSV export capabilities for detailed analysis.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>Audit Logging</h3>
                <p>Immutable append-only audit log tracking all system actions for compliance and transparency.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👁️</div>
                <h3>Observer Mode</h3>
                <p>Read-only access for observers to monitor elections and view audit logs in real-time.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚙️</div>
                <h3>Admin Dashboard</h3>
                <p>Comprehensive admin controls for user management, voter approval, and system configuration.</p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="footer" style={{ borderTop: '1px solid #eee', marginTop: '60px', padding: '20px 0', textAlign: 'center' }}>
          <div className="footer-content">
            <p>&copy; 2026 Student Voting Platform. All rights reserved.</p>
            <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <Link href="/about">About Us</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

const navStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  backgroundColor: '#fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  width: '100%',
}

const navContainerStyle = {
  display: 'flex',
  justify: 'space-between',
  alignItems: 'center',
  padding: '12px 24px',
  maxWidth: '1200px',
  margin: '0 auto',
}

const backLinkStyle = {
  color: '#0070f3',
  textDecoration: 'none',
  fontWeight: 'bold',
}

import Head from 'next/head'
import Link from 'next/link'

export default function SecurityPage() {
  return (
    <>
      <Head>
        <title>Security &amp; Compliance | Student Voting Platform</title>
        <meta name="description" content="Security architecture, encryption protocols, and compliance measures of our electronic voting system." />
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

        {/* Dedicated Security Content */}
        <main className="main-content" style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
          <section className="security-section">
            <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Security &amp; Compliance</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
              Our platform implements defense-in-depth security measures to protect election integrity, voter privacy, and system availability.
            </p>

            <div className="security-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="security-item" style={cardStyle}>
                <h4>🔐 Encryption</h4>
                <p>All data transmitted over HTTPS with secure session cookies (HttpOnly, Secure, SameSite=Strict).</p>
              </div>

              <div className="security-item" style={cardStyle}>
                <h4>🔑 Authentication</h4>
                <p>Voter ID for voters, bcrypt-hashed passwords for staff. JWT-based sessions for stateless auth.</p>
              </div>

              <div className="security-item" style={cardStyle}>
                <h4>🛡️ Authorization</h4>
                <p>Role-based access control (RBAC) enforced at both API and database levels.</p>
              </div>

              <div className="security-item" style={cardStyle}>
                <h4>📋 Auditability</h4>
                <p>Append-only audit logs track all actions including votes, election changes, and user role modifications.</p>
              </div>

              <div className="security-item" style={cardStyle}>
                <h4>🔒 Data Integrity</h4>
                <p>Database constraints ensure one vote per voter per election at the database level.</p>
              </div>

              <div className="security-item" style={cardStyle}>
                <h4>⚠️ Rate Limiting</h4>
                <p>Auth endpoints protected with rate limiting to prevent brute force attacks.</p>
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
  justifyContent: 'space-between',
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

const cardStyle = {
  padding: '20px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  backgroundColor: '#fafafa',
}

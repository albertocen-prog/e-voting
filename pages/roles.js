import Head from 'next/head'
import Link from 'next/link'

export default function RolesPage() {
  return (
    <>
      <Head>
        <title>User Roles &amp; Permissions | Student Voting Platform</title>
        <meta name="description" content="Overview of system user roles and access control permissions." />
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

        {/* Main Roles Content */}
        <main className="main-content" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
          <section className="user-roles">
            <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>User Roles &amp; Permissions</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
              Granular role-based access control (RBAC) ensuring appropriate separation of duties across the platform.
            </p>

            <div className="roles-grid">
              <div className="role-card">
                <h3>🗳️ Voter</h3>
                <ul>
                  <li>Register for voting</li>
                  <li>Login with voter ID</li>
                  <li>Cast one vote per election</li>
                  <li>View voting receipt</li>
                  <li>Access results after election closes</li>
                </ul>
              </div>

              <div className="role-card">
                <h3>👔 Election Official</h3>
                <ul>
                  <li>Create and manage elections</li>
                  <li>Configure ballots and options</li>
                  <li>Open and close elections</li>
                  <li>Approve voter registrations</li>
                  <li>View real-time results</li>
                </ul>
              </div>

              <div className="role-card">
                <h3>👁️ Observer</h3>
                <ul>
                  <li>Monitor election status</li>
                  <li>View live vote aggregation</li>
                  <li>Access audit logs</li>
                  <li>Export results reports</li>
                  <li>Read-only permissions</li>
                </ul>
              </div>

              <div className="role-card">
                <h3>⚙️ Administrator</h3>
                <ul>
                  <li>Full system access</li>
                  <li>Manage users and roles</li>
                  <li>Configure system settings</li>
                  <li>Delete elections/users</li>
                  <li>Access all audit logs</li>
                </ul>
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

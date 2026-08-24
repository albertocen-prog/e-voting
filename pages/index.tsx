import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email?: string
  role: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in by verifying session
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          setLoading(false)
        }
      } catch (error) {
        console.error('Health check failed:', error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <>
      <Head>
        <title>Student Voting Platform</title>
        <meta name="description" content="Secure Electronic Voting System for Academic Institutions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="page-wrapper">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <h2>🗳️ Student Voting Platform</h2>
            </div>
            <ul className="nav-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/elections">Elections</Link></li>
              <li><Link href="/auth/login">Login</Link></li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <div className="hero-section">
            <div className="hero-content">
              <h1>Welcome to Student Voting Platform</h1>
              <p className="subtitle">
                A secure, transparent, and accessible electronic voting system designed for academic institutions
              </p>

              <div className="cta-buttons">
                <Link href="/auth/voter-login" className="btn btn-primary">
                  Vote as Voter
                </Link>
                <Link href="/auth/login" className="btn btn-secondary">
                  Login as Official
                </Link>
              </div>
            </div>

            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-number">🔐</div>
                <div className="stat-label">Bank-Grade Security</div>
                <p>End-to-end encrypted voting</p>
              </div>
              <div className="stat-card">
                <div className="stat-number">📊</div>
                <div className="stat-label">Real-Time Results</div>
                <p>Instant vote aggregation</p>
              </div>
              <div className="stat-card">
                <div className="stat-number">📋</div>
                <div className="stat-label">Audit Trail</div>
                <p>Complete voting records</p>
              </div>
              <div className="stat-card">
                <div className="stat-number">♿</div>
                <div className="stat-label">Accessible</div>
                <p>WCAG compliant interface</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <section className="features-section">
            <h2>Key Features</h2>
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
                <h3>Results & Reporting</h3>
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

          {/* How It Works Section */}
          <section className="how-it-works">
            <h2>How It Works</h2>
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Register as Voter</h3>
                <p>Submit your voter registration with required information. Elections officials will review and approve your registration.</p>
              </div>

              <div className="step-arrow">→</div>

              <div className="step">
                <div className="step-number">2</div>
                <h3>Authenticate</h3>
                <p>Login using your voter ID when an election is open. Your session is secured with encrypted cookies.</p>
              </div>

              <div className="step-arrow">→</div>

              <div className="step">
                <div className="step-number">3</div>
                <h3>Cast Your Vote</h3>
                <p>Select your preferred option from the ballot. The system ensures one vote per voter per election.</p>
              </div>

              <div className="step-arrow">→</div>

              <div className="step">
                <div className="step-number">4</div>
                <h3>View Results</h3>
                <p>Once the election closes, view real-time results aggregated from all votes cast.</p>
              </div>
            </div>
          </section>

          {/* User Roles Section */}
          <section className="user-roles">
            <h2>User Roles & Permissions</h2>
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

          {/* Security Section */}
          <section className="security-section">
            <h2>Security & Compliance</h2>
            <div className="security-features">
              <div className="security-item">
                <h4>🔐 Encryption</h4>
                <p>All data transmitted over HTTPS with secure session cookies (HttpOnly, Secure, SameSite=Strict)</p>
              </div>
              <div className="security-item">
                <h4>🔑 Authentication</h4>
                <p>Voter ID for voters, bcrypt-hashed passwords for staff. JWT-based sessions for stateless auth.</p>
              </div>
              <div className="security-item">
                <h4>🛡️ Authorization</h4>
                <p>Role-based access control (RBAC) enforced at both API and database levels</p>
              </div>
              <div className="security-item">
                <h4>📋 Auditability</h4>
                <p>Append-only audit logs track all actions including votes, election changes, and user role modifications</p>
              </div>
              <div className="security-item">
                <h4>🔒 Data Integrity</h4>
                <p>Database constraints ensure one vote per voter per election at the database level</p>
              </div>
              <div className="security-item">
                <h4>⚠️ Rate Limiting</h4>
                <p>Auth endpoints protected with rate limiting to prevent brute force attacks</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <h2>Ready to Get Started?</h2>
            <p>Experience secure and transparent voting for your institution</p>
            <div className="cta-buttons">
              <Link href="/auth/voter-login" className="btn btn-primary btn-large">
                Vote Now
              </Link>
              <Link href="/auth/login" className="btn btn-secondary btn-large">
                Admin Login
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p>&copy; 2024 Student Voting Platform. All rights reserved.</p>
            <div className="footer-links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/contact">Contact Us</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

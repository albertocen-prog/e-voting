import Head from 'next/head'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <>
      <Head>
        <title>How It Works | Student Voting Platform</title>
        <meta name="description" content="Step-by-step guide on how to register, authenticate, vote, and view election results." />
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

        {/* Main Content */}
        <main className="main-content" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
          <section className="how-it-works">
            <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>How It Works</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
              A simple, secure, four-step process for participating in elections.
            </p>

            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Register as Voter</h3>
                <p>Submit your voter registration with required information. Elections officials will review and approve your registration.</p>
              </div>

              <div className="step-arrow">&rarr;</div>

              <div className="step">
                <div className="step-number">2</div>
                <h3>Authenticate</h3>
                <p>Login using your voter ID when an election is open. Your session is secured with encrypted cookies.</p>
              </div>

              <div className="step-arrow">&rarr;</div>

              <div className="step">
                <div className="step-number">3</div>
                <h3>Cast Your Vote</h3>
                <p>Select your preferred option from the ballot. The system ensures one vote per voter per election.</p>
              </div>

              <div className="step-arrow">&rarr;</div>

              <div className="step">
                <div className="step-number">4</div>
                <h3>View Results</h3>
                <p>Once the election closes, view real-time results aggregated from all votes cast.</p>
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

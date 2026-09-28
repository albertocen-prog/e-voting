import Head from 'next/head';
import Link from 'next/link';

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us | E-Voting Platform</title>
        <meta name="description" content="Learn about our secure, transparent, and verifiable electronic voting system." />
      </Head>

      <main style={containerStyle}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>About Our Platform</h1>
        <p style={{ color: '#666', fontSize: '1rem', marginBottom: '30px' }}>
          Empowering democratic participation through cutting-edge cryptography, high availability, and uncompromised voter anonymity.
        </p>

        <section style={sectionStyle}>
          <h2>1. Our Mission</h2>
          <p>
            Our Electronic Voting System was built to modernize democratic elections for academic institutions, 
            organizations, and enterprises. We aim to make voting accessible, transparent, and immune to ballot tampering, 
            ensuring every legitimate vote is accurately tallied while keeping each voter&apos;s choice strictly confidential.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>2. How It Works</h2>
          <p>
            Our platform balances trust and privacy through a modular, role-separated architecture:
          </p>
          <ul>
            <li>
              <strong>Cryptographic Ballot Security:</strong> Votes are encrypted at the client level using hardware-backed 
              key management (AWS KMS) before being stored.
            </li>
            <li>
              <strong>Decoupled Voter Identity:</strong> The database keeps registration and voting records separate so 
              that election administrators can verify <em>that</em> you voted without ever seeing <em>how</em> you voted.
            </li>
            <li>
              <strong>Multi-Tiered Access:</strong> Dedicated dashboards allow System Administrators, Election Officials, 
              and Independent Observers to audit system activity in real time without compromising ballot security.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2>3. Key System Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={featureBoxStyle}>
              <h4 style={{ margin: '0 0 8px 0' }}>🔒 End-to-End Encryption</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#555' }}>
                Data in transit and at rest is secured via TLS and AWS KMS cryptographic controls.
              </p>
            </div>
            <div style={featureBoxStyle}>
              <h4 style={{ margin: '0 0 8px 0' }}>📋 Immutable Audit Logs</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#555' }}>
                Every critical administrative action and ballot status change is recorded for full post-election auditing.
              </p>
            </div>
            <div style={featureBoxStyle}>
              <h4 style={{ margin: '0 0 8px 0' }}>🚀 Cloud Infrastructure</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#555' }}>
                Hosted on high-availability Render cloud services with Next.js and Prisma ORM for seamless scaling.
              </p>
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2>4. Governance &amp; Compliance</h2>
          <p>
            Designed to meet stringent organizational compliance guidelines, the system incorporates strict role-based 
            access controls (RBAC) and automated voter registration workflows. 
            For complete details on data handling and user governance, please review our legal guidelines:
          </p>
          <ul>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </section>

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '40px 0' }} />

        <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          Back to <Link href="/">Home Page</Link> | <Link href="/register">Voter Registration</Link> | <Link href="/login">Login</Link>
        </p>
      </main>
    </>
  );
}

const containerStyle = {
  maxWidth: '800px',
  margin: '40px auto',
  padding: '30px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  lineHeight: '1.6',
  color: '#333',
  background: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};

const sectionStyle = {
  marginBottom: '28px',
};

const featureBoxStyle = {
  padding: '16px',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  backgroundColor: '#fafafa',
};

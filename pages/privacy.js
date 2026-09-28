import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const lastUpdated = 'September 28, 2026';

  return (
    <>
      <Head>
        <title>Privacy Policy | E-Voting Platform</title>
        <meta name="description" content="Privacy Policy for our secure Electronic Voting System" />
      </Head>

      <main style={containerStyle}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Privacy Policy</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '30px' }}>
          <strong>Effective Date:</strong> {lastUpdated}
        </p>

        <section style={sectionStyle}>
          <h2>1. Introduction</h2>
          <p>
            Welcome to our Electronic Voting Platform ("Platform"). We are committed to protecting 
            voter privacy, maintaining the anonymity of your ballot, and ensuring the absolute integrity 
            of every election held on our system. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our website and voting services.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>2. Information We Collect</h2>
          <p>We collect minimal personal information necessary to verify voting eligibility and maintain security:</p>
          <ul>
            <li>
              <strong>Voter Registration Data:</strong> Full name, Voter ID / Student Identification Number, 
              email address, and verification documentation submitted during registration.
            </li>
            <li>
              <strong>Staff Credentials:</strong> Name, email address, role (Administrator, Election Official, 
              or Observer), and security access key details.
            </li>
            <li>
              <strong>System & Audit Logs:</strong> IP address, device browser type, login timestamps, and 
              administrative actions to audit platform integrity and prevent fraud.
            </li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2>3. Ballot Anonymity & Cryptographic Security</h2>
          <p>
            <strong>Your vote is strictly confidential and decoupled from your identity.</strong>
          </p>
          <p>
            When a vote is cast, our system uses cryptographic techniques (including hardware key encryption via 
            AWS KMS) to separate your identity (voter record) from your choice (ballot entry). Election 
            officials, administrators, and observers can verify that you have cast a ballot, but 
            <strong> no one can see or trace which options you voted for</strong>.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>4. How We Use Your Information</h2>
          <p>We use the collected information exclusively for the following purposes:</p>
          <ul>
            <li>Authenticating your identity and verifying voting eligibility.</li>
            <li>Preventing double voting, fraud, and unauthorized access.</li>
            <li>Sending critical election notifications (e.g., ballot confirmation codes, status updates).</li>
            <li>Maintaining system security and auditing election processes.</li>
          </ul>
          <p>We <strong>never</strong> sell, rent, or trade your personal data to third parties for commercial or marketing purposes.</p>
        </section>

        <section style={sectionStyle}>
          <h2>5. Data Storage & Third-Party Services</h2>
          <p>
            To deliver secure cloud functionality, we utilize trusted enterprise cloud service providers:
          </p>
          <ul>
            <li><strong>Database Hosting & Compute:</strong> Render Cloud Services.</li>
            <li><strong>Cryptographic Key Management & Storage:</strong> Amazon Web Services (AWS KMS / AWS S3).</li>
          </ul>
          <p>
            All data in transit is encrypted using Industry-Standard TLS (HTTPS), and sensitive information stored in databases is encrypted at rest.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>6. Data Retention</h2>
          <p>
            Personal data collected for an election is retained only for as long as necessary to fulfill the election 
            cycle, complete auditing, resolve disputes, or comply with legal obligations. Audit logs and encrypted election 
            tallies may be preserved for official archive purposes.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>7. Your Rights</h2>
          <p>Depending on your jurisdiction, you have the right to:</p>
          <ul>
            <li>Request access to the personal data we hold about you.</li>
            <li>Request corrections to inaccurate voter profile information.</li>
            <li>Request deletion of your profile (subject to active election integrity retention requirements).</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2>8. Contact Information</h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy or data security, please contact the System Administrator or Election Official through your organization’s support portal.
          </p>
        </section>

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '40px 0' }} />

        <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          Back to <Link href="/">Home Page</Link> | <Link href="/login">Login</Link>
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

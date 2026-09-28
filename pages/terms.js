import Head from 'next/head';
import Link from 'next/link';

export default function TermsOfService() {
  const lastUpdated = 'September 28, 2026';

  return (
    <>
      <Head>
        <title>Terms of Service | E-Voting Platform</title>
        <meta name="description" content="Terms of Service and User Agreement for our Electronic Voting System" />
      </Head>

      <main style={containerStyle}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Terms of Service</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '30px' }}>
          <strong>Effective Date:</strong> {lastUpdated}
        </p>

        <section style={sectionStyle}>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our Electronic Voting Platform (&quot;Platform&quot;), you agree to be bound by these 
            Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you must not access or use the 
            Platform. These Terms apply to all voters, election officials, system administrators, and observers.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>2. User Roles &amp; Account Responsibility</h2>
          <p>User access levels on the Platform are strictly categorized:</p>
          <ul>
            <li>
              <strong>Voters:</strong> Granted access to participate in active, authorized elections. You are responsible for 
              maintaining the secrecy of your voter login credentials.
            </li>
            <li>
              <strong>Staff (Admins, Officials, Observers):</strong> Granted elevated administrative access. Staff members 
              must strictly adhere to organizational governance and maintain duty-of-care over election setup and monitoring.
            </li>
          </ul>
          <p>
            You are solely responsible for all activities that occur under your account. You must notify system administration 
            immediately upon suspecting any unauthorized access.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>3. Electoral Integrity &amp; Prohibited Conduct</h2>
          <p>
            The security and fairness of elections are paramount. You agree <strong>NOT</strong> to:
          </p>
          <ul>
            <li>Attempt to cast multiple votes, impersonate another registered voter, or forge voter identification.</li>
            <li>Coerce, bribe, or intimidate any voter during ballot submission.</li>
            <li>Attempt to probe, scan, exploit, or bypass system security mechanisms, AWS KMS keys, or API rate limits.</li>
            <li>Decompile, reverse-engineer, or tamper with the platform&apos;s underlying code or database architecture.</li>
            <li>Share assigned authorization keys for administrative or staff roles with unauthorized individuals.</li>
          </ul>
          <p>
            Violations of electoral integrity may result in immediate account revocation, disqualification of fraudulent votes, 
            and legal or disciplinary prosecution by your organization.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>4. Voter Identity &amp; Ballot Confidentiality</h2>
          <p>
            Our Platform guarantees secret ballot voting using automated cryptographic isolation. While your account record 
            verifies that you participated in an election, your individual selections cannot be inspected or reconstructed by 
            administrators, officials, or third parties.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>5. System Availability &amp; Modifications</h2>
          <p>
            We strive to maintain continuous platform availability during official election windows. However, we reserve the 
            right to modify, suspend, or temporarily interrupt platform operations for critical security updates, maintenance, 
            or emergency protocol enforcement without prior notice.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, the Platform and its operators shall not be liable for any indirect, 
            incidental, or consequential damages resulting from unauthorized account access, network interruptions beyond our 
            control, or user submission errors during ballot casting.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>7. Updates to Terms</h2>
          <p>
            We reserve the right to revise these Terms at any time. Your continued use of the Platform following any modifications 
            signifies your acceptance of the revised Terms.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>8. Contact Us</h2>
          <p>
            For inquiries regarding these Terms or electoral compliance, please reach out to your organizational Election Administrator.
          </p>
        </section>

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '40px 0' }} />

        <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          Back to <Link href="/">Home Page</Link> | <Link href="/privacy">Privacy Policy</Link>
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

import { useState } from 'react';
import './App.css';

interface IdentifyResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

function App() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/v1/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phoneNumber }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to identify contact');
      }
      const data = await res.json();
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Bitespeed Identity Reconciliation</h1>
      <form className="identity-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email"
        />
        <label>Phone Number</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Identifying...' : 'Identify'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {result && (
        <div className="result">
          <h2>Contact Details</h2>
          <p><strong>Primary Contact ID:</strong> {result.contact.primaryContactId}</p>
          <p><strong>Emails:</strong> {result.contact.emails.join(', ')}</p>
          <p><strong>Phone Numbers:</strong> {result.contact.phoneNumbers.join(', ')}</p>
          <p><strong>Secondary Contact IDs:</strong> {result.contact.secondaryContactIds.join(', ') || 'None'}</p>
        </div>
      )}
      <footer>
        <p>Made with ❤️ for Bitespeed Backend Task</p>
      </footer>
    </div>
  );
}

export default App;

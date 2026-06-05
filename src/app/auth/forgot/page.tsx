'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function ForgotPasswordForm() {
  const { signOut } = useAuth(); // optional, can be used to clear session
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) { setError('Email is required'); return; }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage('Password reset link sent. Check your email.');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 style={{ color: '#e5e2e0', letterSpacing: '0.3em', fontSize: '14px', textAlign: 'center', margin: 0 }}>RESET PASSWORD</h1>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="auth-input"
        />
        {error && <p style={{ color: '#ff4b4b', fontSize: '12px' }}>{error}</p>}
        {message && <p style={{ color: '#4caf50', fontSize: '12px' }}>{message}</p>}
        <button
          onClick={handleReset}
          disabled={loading}
          style={{ padding: '1rem', background: 'transparent', border: '1px solid rgba(229,226,224,0.3)', color: '#e5e2e0', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.2em', fontSize: '11px', opacity: loading ? 0.5 : 1, transition: 'all 0.3s' }}
        >
          {loading ? 'SENDING...' : 'SEND RESET LINK'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(229,226,224,0.4)', margin: 0 }}>
          Remembered?{' '}
          <Link href="/auth/login" style={{ color: '#e5e2e0', letterSpacing: '0.1em' }}>SIGN IN</Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function ForgotPasswordForm() {
  const { signOut } = useAuth(); // signOut can be used to clear session if needed
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) { setError('Email is required'); return; }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage('Password reset link sent. Check your email.');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 style={{ color: '#e5e2e0', letterSpacing: '0.3em', fontSize: '14px', textAlign: 'center', margin: 0 }}>RESET PASSWORD</h1>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(229,226,224,0.2)', padding: '0.75rem 0', color: '#e5e2e0', outline: 'none', fontSize: '13px', width: '100%' }}
        />
        {error && <p style={{ color: '#ff4b4b', fontSize: '12px' }}>{error}</p>}
        {message && <p style={{ color: '#4caf50', fontSize: '12px' }}>{message}</p>}
        <button
          onClick={handleReset}
          disabled={loading}
          style={{ padding: '1rem', background: 'transparent', border: '1px solid rgba(229,226,224,0.3)', color: '#e5e2e0', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.2em', fontSize: '11px', opacity: loading ? 0.5 : 1, transition: 'all 0.3s' }}
        >
          {loading ? 'SENDING...' : 'SEND RESET LINK'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(229,226,224,0.4)', margin: 0 }}>
          Remembered?{' '}
          <Link href="/auth/login" style={{ color: '#e5e2e0', letterSpacing: '0.1em' }}>SIGN IN</Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    // Using Supabase auth API directly
    const { error } = await fetch('/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then(r => r.json());
    if (error) {
      setError(error);
    } else {
      setMessage('Recovery email sent. Please check your inbox.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 style={{ color: '#e5e2e0', letterSpacing: '0.3em', fontSize: '14px', textAlign: 'center', margin: 0 }}>
          RESET PASSWORD
        </h1>
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" />
        {error && <p style={{ color: '#ff4b4b', fontSize: '12px' }}>{error}</p>}
        {message && <p style={{ color: '#4caf50', fontSize: '12px' }}>{message}</p>}
        <button onClick={handleReset} disabled={loading} style={{ padding: '1rem', background: 'transparent', border: '1px solid rgba(229,226,224,0.3)', color: '#e5e2e0', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.2em', fontSize: '11px', opacity: loading ? 0.5 : 1, transition: 'all 0.3s' }}>
          {loading ? 'SENDING...' : 'SEND RESET LINK'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(229,226,224,0.4)', margin: 0 }}>
          Remembered?{' '}
          <Link href="/auth/login" style={{ color: '#e5e2e0', letterSpacing: '0.1em' }}>
            SIGN IN
          </Link>
        </p>
      </div>
    </div>
  );
}

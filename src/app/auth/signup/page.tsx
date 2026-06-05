'use client';
import { useState, Suspense } from 'react';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from '../auth.module.css';

const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(229,226,224,0.2)',
    padding: '0.75rem 0',
    color: '#e5e2e0',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
    marginBottom: '1rem',
};

function SignUpForm() {
  const { signUp: authSignUp, addAddress } = useAuth();

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const { fullName, email, phone, password, confirm } = form;
    if (!fullName || !email || !phone || !password || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: signUpError } = await authSignUp(email, password, fullName, phone);
    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  };
  if (success) return (
    <div className={styles.successContainer}>
      <div className={styles.successMessage}>
        <h1 className={styles.heading}>CREATE ACCOUNT</h1>
        <p className={styles.subtext}>Check your inbox and click the confirmation link to activate your account.</p>
        <Link href="/auth/login" className={styles.linkText}>BACK TO LOGIN</Link>
      </div>
    </div>
  );

  const fields = [
    { key: 'fullName', placeholder: 'Full Name', type: 'text' },
    { key: 'email', placeholder: 'Email Address', type: 'email' },
    { key: 'phone', placeholder: 'Phone Number', type: 'tel' },
    { key: 'password', placeholder: 'Password', type: 'password' },
    { key: 'confirm', placeholder: 'Confirm Password', type: 'password' },
  ];

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h1 className={styles.heading}>CREATE ACCOUNT</h1>
        {fields.map(field => (
          <input
            key={field.key}
            type={field.type}
            placeholder={field.placeholder}
            value={form[field.key as keyof typeof form]}
            onChange={e => setForm({ ...form, [field.key]: e.target.value })}
            className={styles.inputField}
          />
        ))}
        {error && <p className={styles.errorMsg}>{error}</p>}
        <button onClick={handleSubmit} disabled={loading} className={styles.authButton}>
          {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
        </button>
        <p className={styles.footerText}>
          {"Already have an account? "}<Link href="/auth/login" className={styles.linkText}>LOGIN</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return <Suspense><SignUpForm /></Suspense>;
}
'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../auth.module.css';
import Link from 'next/link';


const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(229,226,224,0.2)',
    padding: '0.75rem 0',
    color: '#e5e2e0',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
};

function LoginForm() {
    const { signIn } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) { setError('All fields are required.'); return; }
        setLoading(true);
        setError('');
        const { error } = await signIn(email, password);
        if (error) { setError(error); setLoading(false); return; }
        const from = searchParams.get('from') || '/account';
        router.push(from);
    };

    return (
        <div className={styles.authContainer}>
          <div className={styles.authForm}>
            <h1 className={styles.heading}>SIGN IN</h1>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.inputField}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className={styles.inputField}
            />
            {error && <p className={styles.errorMsg}>{error}</p>}
            <button onClick={handleLogin} disabled={loading} className={styles.authButton}>
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
            <p className={styles.footerText}>
              No account? <Link href="/auth/signup" className={styles.linkText}>CREATE ONE</Link>
            </p>
          </div>
        </div>
    );
}

export default function UserLoginPage() {
    return <Suspense><LoginForm /></Suspense>;
}
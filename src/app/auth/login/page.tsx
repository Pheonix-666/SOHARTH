'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0909', padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '420px', padding: '3rem', border: '1px solid rgba(229,226,224,0.15)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h1 style={{ color: '#e5e2e0', letterSpacing: '0.3em', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                    SIGN IN
                </h1>

                <input type="email" placeholder="Email Address" value={email}
                    onChange={e => setEmail(e.target.value)} style={inputStyle} />
                <input type="password" placeholder="Password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inputStyle} />

                {error && <p style={{ color: '#ff4b4b', fontSize: '12px', margin: 0 }}>{error}</p>}

                <button onClick={handleLogin} disabled={loading}
                    style={{ padding: '1rem', background: 'transparent', border: '1px solid rgba(229,226,224,0.3)', color: '#e5e2e0', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.2em', fontSize: '11px', opacity: loading ? 0.5 : 1, transition: 'all 0.3s' }}>
                    {loading ? 'SIGNING IN...' : 'SIGN IN'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(229,226,224,0.4)', margin: 0 }}>
                    No account?{' '}
                    <Link href="/auth/signup" style={{ color: '#e5e2e0', letterSpacing: '0.1em' }}>CREATE ONE</Link>
                </p>
            </div>
        </div>
    );
}

export default function UserLoginPage() {
    return <Suspense><LoginForm /></Suspense>;
}
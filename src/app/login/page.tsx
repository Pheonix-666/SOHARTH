'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleLogin = async () => {
        if (!password) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok) {
                const from = searchParams.get('from') || '/admin';
                router.push(from);
            } else {
                setError(data.error || 'Invalid password.');
            }
        } catch {
            setError('Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0909',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '3rem',
                border: '1px solid rgba(229,226,224,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
            }}>
                <h1 style={{
                    color: '#e5e2e0',
                    letterSpacing: '0.3em',
                    fontSize: '14px',
                    textAlign: 'center',
                    margin: 0,
                }}>
                    ADMIN ACCESS
                </h1>

                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(229,226,224,0.2)',
                        padding: '0.75rem 0',
                        color: '#e5e2e0',
                        outline: 'none',
                        fontSize: '13px',
                        width: '100%',
                    }}
                />

                {error && (
                    <p style={{ color: '#ff4b4b', fontSize: '12px', margin: 0 }}>
                        {error}
                    </p>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading || !password}
                    style={{
                        padding: '1rem',
                        background: 'transparent',
                        border: '1px solid rgba(229,226,224,0.3)',
                        color: '#e5e2e0',
                        cursor: loading || !password ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.2em',
                        fontSize: '11px',
                        opacity: loading || !password ? 0.5 : 1,
                        transition: 'all 0.3s',
                    }}
                >
                    {loading ? 'VERIFYING...' : 'ENTER'}
                </button>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
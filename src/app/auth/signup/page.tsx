'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function SignupForm() {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signUp } = useAuth();

    const handleSignup = async () => {
        if (!email || !password || !fullName || !phone) {
            setError('Please fill out all fields.');
            return;
        }
        setLoading(true);
        setError('');

        const { error: signUpError } = await signUp(email, password, fullName, phone);

        if (signUpError) {
            setError(signUpError);
            setLoading(false);
        } else {
            router.push('/account');
        }
    };

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div className="glass-panel" style={{
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
                    marginBottom: '1rem',
                }}>
                    CREATE ACCOUNT
                </h1>

                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
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

                <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
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

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSignup()}
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
                    onClick={handleSignup}
                    disabled={loading || !email || !password || !fullName || !phone}
                    style={{
                        padding: '1rem',
                        background: 'transparent',
                        border: '1px solid rgba(229,226,224,0.3)',
                        color: '#e5e2e0',
                        cursor: loading || !email || !password || !fullName || !phone ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.2em',
                        fontSize: '11px',
                        opacity: loading || !email || !password || !fullName || !phone ? 0.5 : 1,
                        transition: 'all 0.3s',
                        marginTop: '1rem',
                    }}
                >
                    {loading ? 'CREATING...' : 'SIGN UP'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(229,226,224,0.5)' }}>
                        Already have an account?{' '}
                        <Link href="/auth/login" style={{ color: '#e5e2e0', textDecoration: 'underline' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)', minHeight: '100vh', background: '#0a0909' }}>
                <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '5rem', color: 'rgba(229,226,224,0.5)' }}>Loading...</div>}>
                    <SignupForm />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}

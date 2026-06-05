'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
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

function SignUpForm() {
    const { signUp } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        fullName: '', email: '', phone: '', password: '', confirm: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!form.fullName || !form.email || !form.password || !form.phone) {
            setError('All fields are required.'); return;
        }
        if (form.password !== form.confirm) {
            setError('Passwords do not match.'); return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.'); return;
        }

        setLoading(true);
        setError('');
        const { error } = await signUp(form.email, form.password, form.fullName, form.phone);
        if (error) { setError(error); setLoading(false); return; }
        setSuccess(true);
        setLoading(false);
    };

    if (success) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0909' }}>
            <div style={{ textAlign: 'center', color: '#e5e2e0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ letterSpacing: '0.3em', fontSize: '14px' }}>VERIFY YOUR EMAIL</h2>
                <p style={{ color: 'rgba(229,226,224,0.5)', fontSize: '13px' }}>
                    Check your inbox and click the confirmation link to activate your account.
                </p>
                <Link href="/auth/login" style={{ color: '#e5e2e0', fontSize: '11px', letterSpacing: '0.2em' }}>
                    BACK TO LOGIN
                </Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0909', padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '420px', padding: '3rem', border: '1px solid rgba(229,226,224,0.15)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h1 style={{ color: '#e5e2e0', letterSpacing: '0.3em', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                    CREATE ACCOUNT
                </h1>

                {[
                    { key: 'fullName', placeholder: 'Full Name', type: 'text' },
                    { key: 'email', placeholder: 'Email Address', type: 'email' },
                    { key: 'phone', placeholder: 'Phone Number', type: 'tel' },
                    { key: 'password', placeholder: 'Password', type: 'password' },
                    { key: 'confirm', placeholder: 'Confirm Password', type: 'password' },
                ].map(field => (
                    <input
                        key={field.key}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        style={inputStyle}
                    />
                ))}

                {error && <p style={{ color: '#ff4b4b', fontSize: '12px', margin: 0 }}>{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ padding: '1rem', background: 'transparent', border: '1px solid rgba(229,226,224,0.3)', color: '#e5e2e0', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.2em', fontSize: '11px', opacity: loading ? 0.5 : 1, transition: 'all 0.3s' }}
                >
                    {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(229,226,224,0.4)', margin: 0 }}>
                    Already have an account?{' '}
                    <Link href="/auth/login" style={{ color: '#e5e2e0', letterSpacing: '0.1em' }}>LOGIN</Link>
                </p>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return <Suspense><SignUpForm /></Suspense>;
}
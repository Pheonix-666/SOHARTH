'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inputStyle: React.CSSProperties = {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(229,226,224,0.2)',
    padding: '0.75rem 0', color: '#e5e2e0',
    outline: 'none', fontSize: '13px', width: '100%',
};

interface Address {
    id: string;
    label: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
}

export default function AccountPage() {
    const { user, profile, loading, signOut } = useAuth();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'Home', line1: '', line2: '', city: '', state: '', pincode: ''
    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login?from=/account');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) fetchAddresses();
    }, [user]);

    const fetchAddresses = async () => {
        const { data } = await supabaseBrowser
            .from('addresses')
            .select('*')
            .eq('user_id', user!.id)
            .order('is_default', { ascending: false });
        setAddresses(data || []);
    };

    const handleAddAddress = async () => {
        if (!newAddress.line1 || !newAddress.city || !newAddress.pincode) {
            setMsg('Please fill in required fields.'); return;
        }
        setSaving(true);
        const { error } = await supabaseBrowser.from('addresses').insert({
            ...newAddress,
            user_id: user!.id,
            is_default: addresses.length === 0,
        });
        if (error) { setMsg(error.message); setSaving(false); return; }
        await fetchAddresses();
        setShowAddAddress(false);
        setNewAddress({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' });
        setMsg('Address saved.');
        setSaving(false);
    };

    const handleDeleteAddress = async (id: string) => {
        await supabaseBrowser.from('addresses').delete().eq('id', id);
        await fetchAddresses();
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0909', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(229,226,224,0.4)', letterSpacing: '0.2em', fontSize: '11px' }}>LOADING...</p>
        </div>
    );

    return (
        <>
            <Navbar />
            <main style={{ minHeight: '100vh', background: '#0a0909', padding: '6rem 2rem 4rem', maxWidth: '800px', margin: '0 auto' }}>

                {/* Profile */}
                <section style={{ marginBottom: '4rem' }}>
                    <div className="account-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ color: '#e5e2e0', letterSpacing: '0.3em', fontSize: '13px', margin: 0 }}>MY ACCOUNT</h1>
                        <button onClick={signOut} style={{ background: 'transparent', border: '1px solid rgba(229,226,224,0.2)', color: 'rgba(229,226,224,0.5)', padding: '0.5rem 1.5rem', cursor: 'pointer', fontSize: '10px', letterSpacing: '0.2em' }}>
                            SIGN OUT
                        </button>
                    </div>
                    <div style={{ border: '1px solid rgba(229,226,224,0.1)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <p style={{ color: '#e5e2e0', fontSize: '13px', margin: 0 }}>{profile?.full_name || 'No name set'}</p>
                        <p style={{ color: 'rgba(229,226,224,0.5)', fontSize: '12px', margin: 0 }}>{user?.email}</p>
                        <p style={{ color: 'rgba(229,226,224,0.5)', fontSize: '12px', margin: 0 }}>{profile?.phone || 'No phone set'}</p>
                    </div>
                </section>

                {/* Addresses */}
                <section style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ color: '#e5e2e0', letterSpacing: '0.3em', fontSize: '13px', margin: 0 }}>SAVED ADDRESSES</h2>
                        <button onClick={() => setShowAddAddress(!showAddAddress)}
                            style={{ background: 'transparent', border: '1px solid rgba(229,226,224,0.2)', color: '#e5e2e0', padding: '0.5rem 1.5rem', cursor: 'pointer', fontSize: '10px', letterSpacing: '0.2em' }}>
                            + ADD NEW
                        </button>
                    </div>

                    {showAddAddress && (
                        <div style={{ border: '1px solid rgba(229,226,224,0.1)', padding: '2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <select value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                                style={{ ...inputStyle, background: '#1c1b1b' }}>
                                <option>Home</option>
                                <option>Work</option>
                                <option>Other</option>
                            </select>
                            {[
                                { key: 'line1', placeholder: 'Address Line 1 *' },
                                { key: 'line2', placeholder: 'Address Line 2' },
                                { key: 'city', placeholder: 'City *' },
                                { key: 'state', placeholder: 'State *' },
                                { key: 'pincode', placeholder: 'Pincode *' },
                            ].map(f => (
                                <input key={f.key} placeholder={f.placeholder}
                                    value={newAddress[f.key as keyof typeof newAddress]}
                                    onChange={e => setNewAddress({ ...newAddress, [f.key]: e.target.value })}
                                    style={inputStyle} />
                            ))}
                            {msg && <p style={{ color: '#ff4b4b', fontSize: '12px', margin: 0 }}>{msg}</p>}
                            <button onClick={handleAddAddress} disabled={saving}
                                style={{ padding: '0.75rem', background: 'transparent', border: '1px solid rgba(229,226,224,0.3)', color: '#e5e2e0', cursor: 'pointer', letterSpacing: '0.2em', fontSize: '11px' }}>
                                {saving ? 'SAVING...' : 'SAVE ADDRESS'}
                            </button>
                        </div>
                    )}

                    {addresses.length === 0 ? (
                        <p style={{ color: 'rgba(229,226,224,0.3)', fontSize: '12px' }}>No addresses saved yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {addresses.map(addr => (
                                <div key={addr.id} style={{ border: '1px solid rgba(229,226,224,0.1)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span style={{ color: '#e5e2e0', fontSize: '10px', letterSpacing: '0.2em' }}>
                                            {addr.label} {addr.is_default && '· DEFAULT'}
                                        </span>
                                        <span style={{ color: 'rgba(229,226,224,0.6)', fontSize: '12px' }}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</span>
                                        <span style={{ color: 'rgba(229,226,224,0.6)', fontSize: '12px' }}>{addr.city}, {addr.state} — {addr.pincode}</span>
                                    </div>
                                    <button onClick={() => handleDeleteAddress(addr.id)}
                                        style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.1em' }}>
                                        REMOVE
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Orders link */}
                <section>
                    <h2 style={{ color: '#e5e2e0', letterSpacing: '0.3em', fontSize: '13px', marginBottom: '1.5rem' }}>ORDER HISTORY</h2>
                    <button onClick={() => router.push('/account/orders')}
                        style={{ padding: '1rem 2rem', background: 'transparent', border: '1px solid rgba(229,226,224,0.2)', color: '#e5e2e0', cursor: 'pointer', letterSpacing: '0.2em', fontSize: '11px' }}>
                        VIEW MY ORDERS →
                    </button>
                </section>

            </main>
            <Footer />
        </>
    );
}
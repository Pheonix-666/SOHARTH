'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Order {
    id: string;
    created_at: string;
    items: { name: string; qty: number; size: string; price: number }[];
    total: number;
}

export default function OrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) router.push('/auth/login?from=/account/orders');
    }, [user, loading]);

    useEffect(() => {
        if (user) {
            supabaseBrowser
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .then(({ data }) => {
                    setOrders(data || []);
                    setFetching(false);
                });
        }
    }, [user]);

    if (loading || fetching) return (
        <div style={{ minHeight: '100vh', background: '#0a0909', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(229,226,224,0.4)', letterSpacing: '0.2em', fontSize: '11px' }}>LOADING...</p>
        </div>
    );

    return (
        <>
            <Navbar />
            <main style={{ minHeight: '100vh', background: '#0a0909', padding: '6rem 2rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ color: '#e5e2e0', letterSpacing: '0.3em', fontSize: '13px', marginBottom: '3rem' }}>ORDER HISTORY</h1>

                {orders.length === 0 ? (
                    <p style={{ color: 'rgba(229,226,224,0.3)', fontSize: '12px' }}>No orders placed yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {orders.map(order => (
                            <div key={order.id} style={{ border: '1px solid rgba(229,226,224,0.1)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#e5e2e0', fontSize: '11px', letterSpacing: '0.2em' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                                    <span style={{ color: 'rgba(229,226,224,0.4)', fontSize: '11px' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {order.items.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'rgba(229,226,224,0.7)', fontSize: '12px' }}>{item.qty}x {item.name} · SIZE {item.size}</span>
                                            <span style={{ color: 'rgba(229,226,224,0.5)', fontSize: '12px' }}>₹{(item.price * item.qty).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ borderTop: '1px solid rgba(229,226,224,0.08)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <span style={{ color: '#e5e2e0', fontSize: '13px' }}>₹{order.total.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
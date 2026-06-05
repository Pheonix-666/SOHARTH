'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart: items, updateQty, removeFromCart, clearCart, isHydrated } = useCart();
  const { user, loading: authLoading, addAddress } = useAuth();
  useEffect(() => {
    if (!authLoading && !user) {
      // redirect to login with return path
      // redirect to login with return path (removed)
    }
  }, [user, authLoading]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '', country: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAllProducts(data); })
      .catch(() => {});
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    // Validate address fields
    const { street, city, state, zip, country } = address;
    if (!street || !city || !state || !zip || !country) {
      alert('Please fill out your shipping address before checkout.');
      return;
    }
    if (items.length === 0) return;
    setIsCheckingOut(true);
    try {
      // Save address to user profile
      const { error: addrError } = await addAddress({ street, city, state, zip, country });
      if (addrError) {
        alert('Failed to save address: ' + addrError);
        setIsCheckingOut(false);
        return;
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, subtotal, tax, total }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        setOrderPlaced(true);
        clearCart();
      } else {
        alert('Order processing failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('A network error occurred. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const crossSell = allProducts.filter(p => !items.find(i => i.id === p.id)).slice(0, 4);

  // Simple input style for address fields
  const addressInputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(229,226,224,0.2)',
    padding: '0.5rem 0',
    color: '#e5e2e0',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
    marginBottom: '0.75rem',
  };

  if (!isHydrated) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="font-label-caps" style={{ letterSpacing: '0.3em', opacity: 0.5 }}>Loading Selection...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (orderPlaced) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '10rem', paddingBottom: 'var(--section-gap)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--primary)', animation: 'scaleIn 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
              task_alt
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.3em' }}>ORDER CONFIRMED</span>
              <h1 className="font-headline-lg" style={{ color: 'var(--primary)' }}>THANK YOU FOR YOUR PATRONAGE</h1>
            </div>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8 }}>
              Your order <strong style={{ color: 'var(--primary)' }}>#{orderId}</strong> has been successfully broadcast to our fulfillment hub.
              A dispatch confirmation along with transit metrics will be transmitted shortly.
            </p>
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(229,226,224,0.1)' }}>
              <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>
                Fulfillment Estimate: 3-5 standard Solar cycles.
              </p>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link href="/products" className="btn-primary" style={{ padding: '1.25rem 2.5rem' }}>
                RETURN TO PRODUCTS
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)' }}>
        <div className="container">

          {/* Header */}
          {/* Address Form (mobile) */}
          <div className="auth-container" style={{ marginBottom: '2rem' }}>
            <div className="auth-form">
              <h2 style={{ color: '#e5e2e0', marginBottom: '1rem' }}>Shipping Address</h2>
              {['street', 'city', 'state', 'zip', 'country'].map(key => (
                <input
                  key={key}
                  type="text"
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={address[key as keyof typeof address]}
                  onChange={e => setAddress({ ...address, [key]: e.target.value })}
                  style={addressInputStyle}
                />
              ))}
            </div>
          </div>
          <header style={{ marginBottom: '4rem' }}>
            <h1 className="font-headline-lg" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Your Selection</h1>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '500px' }}>
              Items meticulously curated from our celestial collections, waiting for their final journey.
            </p>
          </header>

          <div className="cart-grid">

            {/* Items List */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>Your bag is empty.</p>
                  <Link href="/products" className="btn-primary">Explore Collection</Link>
                </div>
              ) : items.map((item, idx) => (
                <div
                  key={`${item.id}-${item.size}`}
                  style={{
                    display: 'flex', gap: '2rem', paddingBottom: '2rem',
                    borderBottom: '1px solid rgba(229,226,224,0.1)',
                    animation: `fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) ${idx * 100}ms both`,
                  }}
                >
                  {/* Thumbnail */}
                  <Link href={`/products/${item.id}`} style={{ position: 'relative', width: '192px', height: '256px', flexShrink: 0, overflow: 'hidden', backgroundColor: 'var(--surface-container)' }}>
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover', transition: 'transform 0.7s ease' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                    />
                  </Link>

                  {/* Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 className="font-headline-md" style={{ color: 'var(--primary)' }}>{item.name}</h3>
                        <p className="font-body-md" style={{ color: 'var(--primary)', flexShrink: 0, marginLeft: '1rem' }}>₹{(item.price * item.qty).toLocaleString()}</p>
                      </div>
                      <p className="font-label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{item.subtitle}</p>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span className="font-caption" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Size: {item.size}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Qty Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(71,71,65,0.3)', padding: '0 0.75rem' }}>
                        <button onClick={() => updateQty(item.id, item.size, -1)} style={{ color: 'var(--on-surface-variant)', padding: '0.5rem 0', transition: 'color 0.3s' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                        </button>
                        <span className="font-body-md" style={{ padding: '0 1rem' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.size, 1)} style={{ color: 'var(--on-surface-variant)', padding: '0.5rem 0', transition: 'color 0.3s' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.size)} className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.3s' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Order Summary Panel */}
            <aside>
              <div className="glass-panel" style={{ padding: '3rem', position: 'sticky', top: '140px' }}>
                <h2 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: '2rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Order Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  {[
                    { label: 'Subtotal', value: `₹${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                    { label: 'Celestial Shipping', value: subtotal > 500 ? 'Complimentary' : '₹25.00' },
                    { label: 'Tax (Estimated)', value: `₹${tax.toFixed(2)}` },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="font-body-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{row.label}</span>
                      <span className="font-body-md" style={{ color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(71,71,65,0.2)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="font-label-caps" style={{ color: 'var(--primary)' }}>ESTIMATED TOTAL</span>
                    <span className="font-headline-md" style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.5rem' }}>PROMO CODE</label>
                  <input
                    type="text" placeholder="ENTER CODE"
                    style={{
                      width: '100%', background: 'transparent', border: 'none',
                      borderBottom: '1px solid rgba(71,71,65,0.4)',
                      padding: '0.5rem 0', color: 'var(--primary)',
                      fontFamily: 'var(--font-body)', fontSize: '12px',
                      letterSpacing: '0.2em', fontWeight: 600, outline: 'none',
                    }}
                  />
                </div>

                {/* Checkout CTA */}
                <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || items.length === 0}
                    className="btn-primary"
                    style={{ width: '100%', padding: '1.25rem', letterSpacing: '0.3em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: isCheckingOut || items.length === 0 ? 0.5 : 1, cursor: isCheckingOut || items.length === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    {isCheckingOut ? 'PROCESSING...' : 'SECURE CHECKOUT'}
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', transition: 'transform 0.3s' }}>arrow_forward</span>
                  </button>

                  {/* Trust Badges */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', paddingTop: '1rem', opacity: 0.4 }}>
                    {['security', 'credit_card', 'verified_user'].map(icon => (
                      <span key={icon} className="material-symbols-outlined" style={{ fontSize: '2rem' }}>{icon}</span>
                    ))}
                  </div>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)', textAlign: 'center', opacity: 0.6, fontStyle: 'italic', maxWidth: '280px', margin: '0 auto' }}>
                    All transactions are encrypted through our secure lunar relay system.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* ─── COMPLETE YOUR ENSEMBLE ─── */}
          <section style={{ marginTop: 'var(--section-gap)' }}>
            <h3 className="font-label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem', letterSpacing: '0.3em' }}>
              COMPLETE YOUR ENSEMBLE
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gutter)' }}>
              {crossSell.map(p => (
                <Link href={`/products/${p.id}`} key={p.id} className="product-card" style={{ display: 'block' }}>
                  <div className="card-image" style={{ aspectRatio: '3/4', position: 'relative', marginBottom: '1rem', backgroundColor: 'var(--surface-container)' }}>
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                    <button className="material-symbols-outlined" style={{
                      position: 'absolute', bottom: '1rem', right: '1rem',
                      backgroundColor: 'rgba(20,19,19,0.8)', backdropFilter: 'blur(8px)',
                      padding: '0.75rem', color: 'var(--primary)', fontSize: '20px',
                      opacity: 0, transition: 'opacity 0.3s',
                    }}>add_shopping_cart</button>
                  </div>
                  <h4 className="font-body-md" style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{p.name}</h4>
                  <p className="font-label-caps" style={{ color: 'var(--on-surface-variant)' }}>₹{p.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
